# Last Talk - backtrader-v3
Updated: 20260106_215531

---

## User

Như vậy tối ưu được bước nào để tăng được performance (giảm thời gian chạy xong backtest) ?

---

## Claude

## Phân tích Performance & Optimization

### **Đo lường thời gian hiện tại (ước tính)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Step                        │ Time (30 tickers, 2 năm) │ % Total │ Bottleneck│
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Trino Query              │ ~15-30 giây              │ 20-30%  │ Network   │
│  2. TrinoDailyLoader         │ ~1-2 giây                │ 2%      │ Low       │
│  3. Filter by ticker         │ ~0.1 giây                │ <1%     │ Low       │
│  4. CSVDataFeed._load()      │ ~10-20 giây              │ 15-25%  │ Per-bar   │
│  5. Strategy.next()          │ ~30-60 giây              │ 40-50%  │ Logic     │
│  6. DB writes (orders/trades)│ ~10-20 giây              │ 15-20%  │ I/O       │
├─────────────────────────────────────────────────────────────────────────────┤
│  TOTAL                       │ ~70-130 giây             │ 100%    │           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### **Optimization Opportunities**

#### **1. 🔴 HIGH IMPACT: Cache Trino Data (Step 1)**

**Vấn đề:** Mỗi lần chạy backtest đều query Trino → chậm + tốn network

**Giải pháp:** Cache data ra local file (Parquet/Feather)

```python
# data/loaders/cached_loader.py
import hashlib
from pathlib import Path

class CachedTrinoLoader(TrinoDailyLoader):
    def __init__(self, connection_string: str, cache_dir: str = ".cache/data"):
        super().__init__(connection_string)
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_cache_key(self, tickers: list, from_date, to_date) -> str:
        key = f"{sorted(tickers)}_{from_date}_{to_date}"
        return hashlib.md5(key.encode()).hexdigest()
    
    def load_historical(self, tickers, from_date, to_date) -> pd.DataFrame:
        cache_key = self._get_cache_key(tickers, from_date, to_date)
        cache_file = self.cache_dir / f"{cache_key}.parquet"
        
        # Check cache
        if cache_file.exists():
            logger.info(f"Loading from cache: {cache_file}")
            return pd.read_parquet(cache_file)  # ~0.5 giây vs 15-30 giây
        
        # Load from Trino
        df = super().load_historical(tickers, from_date, to_date)
        
        # Save to cache
        df.to_parquet(cache_file, index=False)
        logger.info(f"Cached to: {cache_file}")
        
        return df
```

**Kết quả:** 
- Lần đầu: 15-30 giây (load từ Trino + save cache)
- Lần sau: **0.3-0.5 giây** (load từ Parquet)
- **Tiết kiệm: ~95% thời gian Step 1**

---

#### **2. 🔴 HIGH IMPACT: Vectorized Data Feed (Step 4)**

**Vấn đề:** `CSVDataFeed._load()` gọi **từng bar một** → chậm

```python
# Hiện tại: Mỗi bar gọi 1 lần _load()
# 30 tickers × 500 ngày = 15,000 lần gọi _load()
```

**Giải pháp:** Preload tất cả data vào memory

```python
# data/feeds/optimized_feed.py
class OptimizedDataFeed(bt.feeds.PandasData):
    """
    Sử dụng PandasData thay vì custom _load()
    Backtrader sẽ đọc trực tiếp từ DataFrame (vectorized)
    """
    
    params = (
        ('datetime', 'transdate'),
        ('open', 'price_adj_opened'),
        ('high', 'price_adj_closed'),  # Dùng close thay high nếu ko có
        ('low', 'price_adj_closed'),
        ('close', 'price_adj_closed'),
        ('volume', 'volume_total'),
        ('openinterest', None),
    )
    
    # Custom lines
    lines = ('price_reference', 'price_nonadj_closed',)
    
    params = params + (
        ('price_reference', 'price_reference'),
        ('price_nonadj_closed', 'price_closed'),
    )
```

**Sử dụng:**
```python
# Trong BacktestRunner
for ticker in tickers:
    df_ticker = df[df['ticker'] == ticker].set_index('transdate')
    feed = OptimizedDataFeed(dataname=df_ticker)
    cerebro.adddata(feed, name=ticker)
```

**Kết quả:**
- Trước: ~10-20 giây (per-bar _load)
- Sau: **~2-3 giây** (vectorized)
- **Tiết kiệm: ~80% thời gian Step 4**

---

#### **3. 🟡 MEDIUM IMPACT: Batch DB Writes (Step 6)**

**Vấn đề:** Mỗi order/trade ghi DB riêng lẻ

```python
# Hiện tại
for order in orders:
    cursor.execute("INSERT INTO orders ...", order)  # 1 roundtrip mỗi order
    conn.commit()
```

**Giải pháp:** Batch insert + single commit

```python
# repositories/order_repo.py
class OrderRepository(BaseRepository):
    def save_orders_batch(self, orders: list[dict]) -> None:
        """Batch insert orders."""
        if not orders:
            return
        
        # Sử dụng executemany hoặc COPY
        from psycopg2.extras import execute_values
        
        sql = """
            INSERT INTO orders (account_id, symbol, qty, price, order_type, status, order_time)
            VALUES %s
        """
        
        values = [
            (o['account_id'], o['symbol'], o['qty'], o['price'], 
             o['order_type'], o['status'], o['order_time'])
            for o in orders
        ]
        
        execute_values(self._cur, sql, values, page_size=100)
        # Commit 1 lần cho tất cả
```

**Kết quả:**
- Trước: ~10-20 giây (nhiều roundtrips)
- Sau: **~2-3 giây** (batch insert)
- **Tiết kiệm: ~80% thời gian DB writes**

---

#### **4. 🟡 MEDIUM IMPACT: Reduce Logging (All Steps)**

**Vấn đề:** Log quá nhiều trong hot path

```python
# Hiện tại trong CSVDataFeed._load()
self.logger.info(
    f"{self.p.ticker} - {row['transdate']} - Close: {self.lines.close[0]} ..."
)
# → 15,000 log entries cho 30 tickers × 500 days!
```

**Giải pháp:** Log level hoặc sampling

```python
# Option 1: Chỉ log ở DEBUG level
self.logger.debug(f"{self.p.ticker} - {row['transdate']} ...")

# Option 2: Sampling - log mỗi 100 bars
if self.last_index % 100 == 0:
    self.logger.info(f"Progress: {self.p.ticker} bar {self.last_index}")

# Option 3: Disable trong backtest mode
import logging
logging.getLogger('CSVDataFeed').setLevel(logging.WARNING)
```

**Kết quả:** Tiết kiệm ~5-10% tổng thời gian

---

#### **5. 🟢 LOWER IMPACT: Numba/Cython cho Indicators (Step 5)**

**Vấn đề:** Tính indicator trong Python loop chậm

```python
# Hiện tại
def calculate_rs_rank(rs1: float, all_rs1_values: list[float]) -> int:
    greater_count = sum(1 for v in all_rs1_values if v > rs1)
    return greater_count + 1
```

**Giải pháp:** Vectorize với NumPy hoặc Numba

```python
import numpy as np
from numba import njit

@njit
def calculate_rs_rank_fast(rs1: float, all_rs1_values: np.ndarray) -> int:
    return np.sum(all_rs1_values > rs1) + 1

# Hoặc vectorized version
def calculate_all_ranks(rs1_values: np.ndarray) -> np.ndarray:
    """Calculate ranks for all values at once."""
    # Argsort descending
    order = np.argsort(-rs1_values)
    ranks = np.empty_like(order)
    ranks[order] = np.arange(1, len(rs1_values) + 1)
    return ranks
```

---

### **Tổng hợp Optimization Plan**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Priority │ Optimization              │ Effort │ Impact      │ Time Saved     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  1        │ Cache Trino → Parquet     │ Low    │ HIGH        │ ~15-25 giây    │
│  2        │ PandasData thay CSVFeed   │ Medium │ HIGH        │ ~8-15 giây     │
│  3        │ Batch DB writes           │ Medium │ MEDIUM      │ ~8-15 giây     │
│  4        │ Reduce logging            │ Low    │ LOW-MEDIUM  │ ~3-5 giây      │
│  5        │ Numba indicators          │ High   │ LOW         │ ~2-3 giây      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  TOTAL POTENTIAL SAVINGS                                     │ ~40-65 giây    │
│  Từ ~70-130 giây → ~25-50 giây (GIẢM 50-60%)                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### **Quick Win Implementation**

Bạn muốn tôi implement optimization nào trước? Recommend:

1. **Cache Trino data** (dễ nhất, impact cao nhất)
2. **PandasData feed** (thay đổi ít code)
3. **Batch DB writes** (cần refactor repositories)

---

