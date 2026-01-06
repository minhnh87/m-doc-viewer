# Last Talk - backtrader-v3
Updated: 20260106_210018

---

## User

model của Historical Backtest Data ?

---

## Claude

## Historical Backtest Data Model

### 1. **Input Data Model** (từ Trino/Data Source)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DataFrame (từ TrinoDailyLoader)              │
├─────────────────────────────────────────────────────────────────┤
│  ticker          : str       # Mã chứng khoán (VNM, VIC, ...)  │
│  transdate       : datetime  # Ngày giao dịch                   │
│  price_opened    : float     # Giá mở cửa (chưa điều chỉnh)     │
│  price_closed    : float     # Giá đóng cửa (chưa điều chỉnh)   │
│  price_highest   : float     # Giá cao nhất (optional)          │
│  price_lowest    : float     # Giá thấp nhất (optional)         │
│  price_reference : float     # Giá tham chiếu                   │
│  volume_total    : float     # Khối lượng giao dịch             │
│  price_adj_opened: float     # Giá mở cửa điều chỉnh            │
│  price_adj_closed: float     # Giá đóng cửa điều chỉnh          │
└─────────────────────────────────────────────────────────────────┘
```

### 2. **Backtrader Data Feed** (CSVDataFeed)

```python
class CSVDataFeed(bt.feeds.DataBase):
    lines = (
        'volume',
        'price_adj_opened', 'price_adj_closed',      # Giá điều chỉnh
        'price_nonadj_opened', 'price_nonadj_closed', # Giá chưa điều chỉnh
        'price_reference',                            # Giá tham chiếu
        'price_opened', 'price_closed',               # Giá OHLC
        'market_check_price',                         # Giá kiểm tra (live)
        'weight_fa', 'weight_ta',                     # Trọng số FA/TA
        'fa_score', 'ta_score', 'final_score',        # Điểm số
        'upside', 'industry',                         # Upside & ngành
    )
```

### 3. **Persistence Models** (Database Tables)

| Table | Mô tả | Key Fields |
|-------|-------|------------|
| **positions** | Vị thế sở hữu | `account_id, symbol, datadate, qty, nextday_qty, avg_price` |
| **cashbalance** | Số dư tiền mặt | `account_id, datadate, balance, nextday_amt` |
| **orders** | Lệnh đặt | `order_id, account_id, symbol, qty, price, order_type, status` |
| **trades** | Giao dịch khớp | `trade_id, account_id, symbol, qty, price, trade_time, fee` |

### 4. **Data Flow Diagram**

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────────┐
│    Trino     │────▶│  TrinoDailyLoader │────▶│   DataFrame     │
│  (Iceberg)   │     │                   │     │  (pandas)       │
└──────────────┘     └───────────────────┘     └────────┬────────┘
                                                        │
                                                        ▼
┌──────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  Backtrader  │◀────│   CSVDataFeed     │◀────│  Filter by      │
│   Cerebro    │     │   (per ticker)    │     │  ticker         │
└──────┬───────┘     └───────────────────┘     └─────────────────┘
       │
       ▼
┌──────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  Strategy    │────▶│   Repositories    │────▶│   PostgreSQL    │
│  (QPMMT)     │     │  (Position,Cash)  │     │   Database      │
└──────────────┘     └───────────────────┘     └─────────────────┘
```

### 5. **Position Model** (PositionRepository)

```python
# Get position
position = {
    'qty': float,           # Số lượng khả dụng hôm nay
    'nextday_qty': float,   # Số lượng T+2 (chưa về)
    'avg_price': float,     # Giá trung bình
}

# Save position
save_position(
    account_id: str,
    symbol: str,
    datadate: date,
    qty: float,
    nextday_qty: float,
    avg_price: float,
    pre_price: float,       # Giá trước đó
    eod_datadate: date      # Ngày EOD
)
```

### 6. **SQL Schema** (từ Trino Query)

```sql
-- Source tables
iceberg.dwh_atomic.dwh_market_prices_and_transactions_securities_daily_prices
iceberg.mart_common.fact_securities_daily_priceadjusted_history

-- Key fields
ticker, transdate, price_floor, price_opened, price_highest,
price_lowest, price_closed, price_reference, volume_total,
price_adjusted (→ price_adj_closed)
```

Bạn muốn tìm hiểu chi tiết về phần nào của data model?

---

