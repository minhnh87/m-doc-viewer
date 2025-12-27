# Tài liệu: Luồng Xử Lý Backtest - TVS Backtrader Ver2

> **Phiên bản:** 1.0
> **Ngày cập nhật:** 2025-12-25
> **Framework:** Backtrader 1.9.78.123

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Sơ đồ luồng tổng thể](#sơ-đồ-luồng-tổng-thể)
3. [Chi tiết từng giai đoạn](#chi-tiết-từng-giai-đoạn)
4. [Các mode chạy backtest](#các-mode-chạy-backtest)
5. [Data Sources & Processing](#data-sources--processing)
6. [Strategy Execution](#strategy-execution)
7. [Order & Trade Processing](#order--trade-processing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

Hệ thống backtest này là một framework event-driven sử dụng Backtrader để:
- Mô phỏng giao dịch chứng khoán Việt Nam
- Hỗ trợ nhiều nguồn dữ liệu (Trino DB, FiinQuant API, CSV)
- Quản lý portfolio đa tài khoản
- Validate và execute orders với quy tắc thị trường VN

### Các thành phần chính:

```
QPTPMAROCBOSS2W.py          → Main orchestrator, data loading
QPTPMAROCstrategy.py        → Strategy logic (ETFStrategy class)
QPTPMAROCBOSS2Wdata.py      → Custom DataFeed for Backtrader
config.py                   → Centralized configuration
mandate_config.py           → Account & ticker management
core/trade_processor.py     → Trade execution & settlement
funct/db_core.py            → Database operations
```

---

## 📊 Sơ đồ luồng tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. KHỞI TẠO & CẤU HÌNH                                          │
├─────────────────────────────────────────────────────────────────┤
│ • Tạo thư mục logs/, results/                                   │
│ • Setup logging (file + console)                                │
│ • Load config từ config.py, mandate_config.py                   │
│ • Khởi tạo Cerebro instance                                     │
│ • Add strategy: ETFStrategy                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. NẠP DỮ LIỆU (DATA LOADING)                                  │
├─────────────────────────────────────────────────────────────────┤
│ A. Historical Data (Daily OHLCV)                                │
│    ├─ Primary: Trino DB query                                   │
│    ├─ Fallback: CSV file                                        │
│    └─ Columns: ticker, transdate, price_adj_opened/closed,      │
│                price_opened/closed, price_reference, volume     │
│                                                                  │
│ B. Market Check Price (13:55 snapshot)                          │
│    ├─ FiinQuant API: get_historical_price_at_time()            │
│    └─ Merge vào df_hist                                         │
│                                                                  │
│ C. Today's Data (Real-time, nếu api/fw_db mode)                │
│    ├─ FiinQuant: get_price_at_time()                           │
│    ├─ Validate: max 7% deviation vs reference price            │
│    └─ Concat với historical data                                │
│                                                                  │
│ D. 5-Minute Data (Optional, cho pattern analysis)              │
│    ├─ Trino DB (nếu hybrid mode)                                │
│    └─ FiinQuant API (fill gaps)                                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CHUẨN BỊ DATAFEEDS                                          │
├─────────────────────────────────────────────────────────────────┤
│ • Filter tickers: đủ bars (>= max_indicator_period)             │
│ • Loại bỏ duplicates theo (ticker, transdate)                   │
│ • Sort theo transdate ASC                                        │
│ • Tạo CSVDataFeed cho từng ticker                               │
│ • Add vào Cerebro: cerebro.adddata(data, name=ticker)          │
│                                                                  │
│ CSVDataFeed custom lines:                                       │
│   - price_adj_opened, price_adj_closed                          │
│   - price_nonadj_opened, price_nonadj_closed                    │
│   - price_reference, market_check_price                         │
│   - volume, fa_score, ta_score, final_score, etc.              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BACKTEST EXECUTION (cerebro.run())                          │
├─────────────────────────────────────────────────────────────────┤
│ Loop qua từng ngày giao dịch:                                   │
│   ↓                                                              │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 4.1 Strategy.next() - Được gọi mỗi bar                    │  │
│ │                                                            │  │
│ │ A. Check Date Continuity (DB mode)                        │  │
│ │    └─ Đảm bảo cashbalance & positions có dữ liệu liên tục │  │
│ │                                                            │  │
│ │ B. Mode Gating                                             │  │
│ │    ├─ fw_db/api: skip nếu current_date < TARGET_DATE     │  │
│ │    ├─ db: skip nếu < DB_MODE_START_DATE                   │  │
│ │    └─ bt_db: chạy từ from_date đến to_date                │  │
│ │                                                            │  │
│ │ C. Rebalance Decision                                      │  │
│ │    ├─ Check: should_rebalance(current_date)               │  │
│ │    │   └─ Theo lịch: mỗi N tuần, vào thứ (rebalancing_day)│ │
│ │    └─ Nếu YES:                                             │  │
│ │        ├─ Generate target_weights: _build_target_weights()│  │
│ │        └─ Execute: _rebalance_to_weights()                │  │
│ │                                                            │  │
│ │ D. Order Generation (_rebalance_to_weights)               │  │
│ │    ├─ Fetch current positions & cash từ DB                │  │
│ │    ├─ Fetch prices từ DataFeed.lines                      │  │
│ │    ├─ Tính target allocation ($ value)                    │  │
│ │    ├─ SELL Phase:                                          │  │
│ │    │   ├─ Sell non-target positions (100%)                │  │
│ │    │   └─ Trim excess (round down by LOT_SIZE)            │  │
│ │    └─ BUY Phase:                                           │  │
│ │        ├─ Calculate buy_budget (cash - buffer)            │  │
│ │        └─ Fill deficits (largest first, round by LOT)     │  │
│ │                                                            │  │
│ │ E. Order Persistence                                       │  │
│ │    ├─ Sort: SELLs (price DESC), BUYs (price ASC)          │  │
│ │    ├─ Call save_orders() cho từng order                   │  │
│ │    │   └─ Insert vào DB: orders table                     │  │
│ │    └─ Clear pending queues                                │  │
│ │                                                            │  │
│ │ F. Trade Processing (process_daily_trades)                │  │
│ │    ├─ Đọc orders chưa có trade                            │  │
│ │    ├─ Execute orders → create trades                      │  │
│ │    ├─ Update positions (next_date)                        │  │
│ │    └─ Update cashbalance (next_date)                      │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. KẾT THÚC & BÁO CÁO                                          │
├─────────────────────────────────────────────────────────────────┤
│ • Strategy.stop() được gọi                                      │
│ • Log final portfolio value                                     │
│ • Flush logs to file                                            │
│ • Output files in results/:                                     │
│   - buy_signal_trades.csv                                       │
│   - sell_signal_trades.csv                                      │
│   - indicators.csv                                              │
│   - portfolio.csv                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Chi tiết từng giai đoạn

### 1. Khởi tạo & Cấu hình

**File:** `QPTPMAROCBOSS2W.py::run_backtest()`

```python
# 1.1 Tạo thư mục
for directory in [LOGS_BASE_DIR, RUN_LOG_DIR, RESULTS_BASE_DIR, RUN_RESULTS_DIR]:
    os.makedirs(directory, exist_ok=True)

# 1.2 Setup logging
logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.FileHandler(BACKTEST_LOG_PATH),
        logging.StreamHandler(sys.stdout)
    ]
)

# 1.3 Khởi tạo Cerebro
cerebro = bt.Cerebro()
cerebro.addstrategy(
    ETFStrategy,
    buy_signal_path=...,
    sell_signal_trades_path=...,
    indicators_path=...,
    portfolio_path=...,
    results_dir=...
)
```

**Config quan trọng:**

| Config | Giá trị mặc định | Ý nghĩa |
|--------|------------------|---------|
| `CORE_SOURCE` | `'api'` | Mode chạy (db/api/fw_db/bt_db) |
| `CURRENT_MODE` | `'fiin_only'` | Data source (hybrid/fiin_only) |
| `BACKTEST_START_DATE` | `(2024, 9, 1)` | Ngày bắt đầu backtest |
| `STRATEGY_EXECUTION_TIME` | `"09:15"` | Thời điểm thực thi strategy |
| `MARKET_CHECK_TIME` | `"13:55"` | Thời điểm lấy snapshot giá |

---

### 2. Nạp dữ liệu (Data Loading)

**File:** `QPTPMAROCBOSS2W.py` (lines 76-447)

#### 2.1 Historical Data từ Trino DB

```sql
-- Query structure:
WITH table1 AS (
    SELECT ticker, transdate, price_opened, price_closed,
           price_reference, volume_total
    FROM dwh_market_prices_and_transactions_securities_daily_prices
    WHERE year(transdate) >= (year(current_date) - 7)
      AND ticker IN ('HPG', 'VHM', 'VCG', ...)
),
table2 AS (
    SELECT ticker, price_adjusted, transdate
    FROM fact_securities_daily_priceadjusted_history
)
SELECT a.*, b.price_adj_closed
FROM table1 a
LEFT JOIN table2 b ON a.ticker = b.ticker AND a.transdate = b.transdate
WHERE transdate >= '2024-09-01' AND transdate < CURRENT_DATE
ORDER BY transdate ASC
```

**Output:** DataFrame với columns:
- `ticker`, `transdate`
- `price_adj_closed`, `price_adj_opened` (adjusted cho corporate actions)
- `price_closed`, `price_opened` (raw)
- `price_reference`, `volume_total`

#### 2.2 Market Check Price (13:55 snapshot)

**Chỉ trong mode `api` hoặc `fw_db`:**

```python
from data.fiin_price_loader import FiinPriceLoader

price_loader = FiinPriceLoader(username=..., password=...)

# Lấy giá lịch sử tại 13:55 từ DB_MODE_START_DATE đến hôm qua
df_market_check = price_loader.get_historical_price_at_time(
    tickers=['HPG', 'VHM', ...],
    start_date=datetime(2025, 9, 1).date(),
    end_date=(datetime.now() - timedelta(days=1)).date(),
    time_str="13:55"
)

# Merge vào df_hist
df_hist = df_hist.merge(
    df_market_check[['ticker', 'transdate', 'market_check_price']],
    on=['ticker', 'transdate'],
    how='left'
)

# Forward fill missing values
df_hist['market_check_price'] = df_hist.groupby('ticker')['market_check_price'].fillna(method='ffill')
```

**Tại sao cần market_check_price?**
- Strategy có thể check giá tại thời điểm cụ thể trong ngày
- Phục vụ cho các signal generation rules (VD: "nếu giá 13:55 > MA50")

#### 2.3 Today's Data (Real-time)

**Chỉ trong mode `api` hoặc `fw_db`:**

```python
# Wait until 13:55 + 6 minutes
if current_time < check_time + timedelta(minutes=6):
    time.sleep(wait_seconds)

# Fetch today's data at check_time
df_today = price_loader.get_price_at_time(tickers, check_time)

# Validate price deviation
if FWDBConfig.PRICE_VALIDATION['enabled']:
    max_dev = 0.07  # 7%
    df_today = df_today[
        abs((df_today['price_closed'] - df_today['price_reference']) /
            df_today['price_reference']) <= max_dev
    ]

# Drop tickers with missing data
missing_tickers = set(tickers) - set(df_today['ticker'].unique())
df_hist = df_hist[~df_hist['ticker'].isin(missing_tickers)]

# Concat with historical
df_hist = pd.concat([df_hist, df_today], ignore_index=True)
```

#### 2.4 5-Minute Data (Optional)

```python
# Load from Trino (hybrid mode)
if CURRENT_MODE == 'hybrid':
    from data.trino_price_loader import load_price_data
    df_5min = load_price_data(tickers, start_date='2025-01-01')

# Fill gaps with FiinQuant
if missing_start_date:
    data = price_loader.client.Fetch_Trading_Data(
        tickers=tickers,
        by='5m',
        from_date=missing_start_date.strftime('%Y-%m-%d %H:%M:%S'),
        to_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )

    # Merge and save to cache
    df_5min = pd.concat([df_5min, temp_data])
    df_5min.to_parquet('price_data_cache.parquet')
```

**Lưu ý:** 5-min data hiện chưa được sử dụng trong strategy logic, chỉ load để chuẩn bị cho future features.

---

### 3. Chuẩn bị DataFeeds

**File:** `QPTPMAROCBOSS2W.py` (lines 458-494)

#### 3.1 Filter Tickers

```python
# Calculate max indicator period needed
max_indicator_period = max(
    ETFStrategy.params.ma_period_long,  # 50
    ETFStrategy.params.roc_period_long  # 50
)

# Filter out tickers with insufficient data
data_lengths = df_hist.groupby('ticker').size()
tickers_too_short = data_lengths[data_lengths < max_indicator_period].index.tolist()
df_hist_filtered = df_hist[~df_hist['ticker'].isin(tickers_too_short)]

all_tickers = df_hist_filtered['ticker'].unique().tolist()
```

#### 3.2 Tạo CSVDataFeed

**File:** `QPTPMAROCBOSS2Wdata.py`

```python
class CSVDataFeed(bt.feeds.DataBase):
    lines = (
        'volume',
        'price_adj_opened', 'price_adj_closed',
        'price_nonadj_opened', 'price_nonadj_closed',
        'price_reference',
        'market_check_price',
        # ... thêm các custom lines khác
    )

    def __init__(self):
        # Lọc dữ liệu cho ticker
        self.df_hist = self.p.df_hist[self.p.df_hist['ticker'] == self.p.ticker].copy()

        # Loại bỏ duplicates
        self.df_hist = self.df_hist.drop_duplicates(
            subset=['ticker', 'transdate'],
            keep='first'
        )

        # Sort và reset index
        self.df_hist = self.df_hist.sort_values('transdate').reset_index(drop=True)

    def _load(self):
        """Called by Backtrader to load next bar"""
        if len(self.df) > self.last_index + 1:
            self.last_index += 1
            row = self.df.iloc[self.last_index]

            # Map DataFrame columns to Backtrader lines
            self.lines.datetime[0] = bt.date2num(row['transdate'])
            self.lines.open[0] = row['price_adj_opened']
            self.lines.close[0] = row['price_adj_closed']
            self.lines.price_reference[0] = row['price_reference']
            self.lines.market_check_price[0] = row.get('market_check_price')
            # ...

            return True
        else:
            return None  # No more data
```

#### 3.3 Add vào Cerebro

```python
for ticker in all_tickers:
    data = CSVDataFeed(
        df_hist=df_hist,
        ticker=ticker,
        name=ticker
    )
    cerebro.adddata(data, name=ticker)

cerebro.broker.setcash(TradingConfig.DEFAULT_INITIAL_CASH)  # 10 tỷ VND
```

---

### 4. Strategy Execution

**File:** `QPTPMAROCstrategy.py::ETFStrategy`

#### 4.1 Strategy.__init__()

```python
def __init__(self):
    # Pending order queues
    self.pending_sell_orders = []
    self.pending_buy_orders = []

    # Universe configuration
    self.tickers = get_tickers(self.p.basket_name)
    self.account_list = get_basket_accounts(self.p.basket_name)
    self.account_mandates = get_account_mandates(self.p.basket_name)

    # Database connection (cho trade processor)
    self.conn = psycopg2.connect(DatabaseConfig.get_connection_string())
    self.cur = self.conn.cursor()

    # Indicators (placeholder - strategy này không dùng indicators)
    self.inds = {}
```

#### 4.2 Strategy.next() - Main Loop

```python
def next(self):
    current_date = self.datetime.date(0)

    # A. Mode gating
    if CORE_SOURCE in ["fw_db", "api"]:
        if current_date < TimeConfig.TARGET_DATE:
            return  # Skip past dates
    elif CORE_SOURCE == "db":
        if current_date < TimeConfig.DB_MODE_START_DATE:
            return

    # B. Check date continuity (DB mode only)
    if CORE_SOURCE in ["db", "bt_db"]:
        for mandate in self.account_mandates:
            self.check_date_continuity(current_date, mandate['account_id'])
            self.process_trades_for_day(current_date, mandate['account_id'])

    # C. Rebalance decision
    if self.should_rebalance(current_date):
        # Generate target weights
        target_weights = self._build_target_weights(current_date)

        # Execute rebalance for each account
        if target_weights:
            for account in self.account_mandates:
                self._rebalance_to_weights(current_date, target_weights, account)

    # D. Persist orders
    self._persist_orders(current_date)

    # E. Stop condition
    if self._should_stop(current_date):
        self.env.runstop()
```

#### 4.3 Rebalance Logic

##### A. Should Rebalance?

```python
def should_rebalance(self, current_date):
    # Check weekday
    rebalancing_day_map = {"Monday": 0, "Friday": 4}
    if current_date.weekday() != rebalancing_day_map[self.p.rebalancing_day]:
        return False

    self.rebalance_counter += 1

    # Live mode: rebalance every scheduled day
    if CORE_SOURCE in ["api", "fw_db"]:
        return True

    # Backtest mode: every N weeks
    return self.rebalance_counter % self.p.rebalancing_weeks == 0
```

##### B. Build Target Weights

```python
def _build_target_weights(self, current_date) -> dict:
    """
    TEMPLATE VERSION: Returns empty dict (no trades)

    PRODUCTION: Replace với proprietary alpha logic
    """
    if not self.p.enable_demo_trades:
        return {}

    # Demo mode: equal-weight portfolio
    universe = list(self.tickers or get_active_tickers_from_trino(current_date))
    universe = universe[:self.p.demo_universe_limit]  # Limit 10 tickers

    if not universe:
        return {}

    weight = 1.0 / len(universe)
    return {ticker: weight for ticker in universe}
```

##### C. Rebalance to Weights

**Đây là logic core của portfolio management:**

```python
def _rebalance_to_weights(self, current_date, target_weights: dict, account_mandate: dict):
    account_id = account_mandate["account_id"]
    LOT_SIZE = account_mandate.get("lot_size", 100)
    MIN_TRADE_VALUE = account_mandate.get("min_trade_value", 0)
    MIN_CASH_PCT = account_mandate.get("min_cash_percent_normal", 0.02)

    # 1. Fetch current state
    positions = get_current_positions(account_id, current_date)  # {ticker: {qty, avg_price}}
    current_cash = get_available_cash(account_id, current_date)

    # 2. Get prices from DataFeed
    prices = {}
    for ticker in set(list(positions.keys()) + list(target_weights.keys())):
        data = self.getdatabyname(ticker)
        prices[ticker] = float(data.price_nonadj_closed[0])

    # 3. Calculate portfolio value
    portfolio_value = sum(
        positions[t]['qty'] * prices[t]
        for t in positions if prices.get(t, 0) > 0
    )
    nav = portfolio_value + current_cash

    # 4. Normalize target weights (exclude tickers with no price)
    target_weights = {
        t: w for t, w in target_weights.items()
        if prices.get(t, 0) > 0 and w > 0
    }
    sum_weights = sum(target_weights.values())
    target_weights = {t: w / sum_weights for t, w in target_weights.items()}

    # 5. Target $ allocation
    target_values = {t: nav * w for t, w in target_weights.items()}

    # === SELL PHASE ===
    sell_proceeds = 0.0

    # 5a. Sell non-target positions (100%)
    for ticker, pos in positions.items():
        if pos['qty'] <= 0:
            continue
        if ticker not in target_weights:
            price = prices.get(ticker, 0)
            if price <= 0:
                continue

            qty_sell = (pos['qty'] // LOT_SIZE) * LOT_SIZE
            if qty_sell <= 0:
                continue

            trade_value = qty_sell * price
            if MIN_TRADE_VALUE and trade_value < MIN_TRADE_VALUE:
                continue

            self.pending_sell_orders.append({
                "order_type": "SELL",
                "ticker": ticker,
                "date": current_date,
                "price": price,
                "qty": qty_sell,
                "status": "PENDING",
                "account_id": account_id,
                "note": "Sell non-target position",
                "order_type_db": "MP",
            })
            sell_proceeds += trade_value

    # 5b. Sell excess vs target allocation
    for ticker, target_weight in target_weights.items():
        price = prices.get(ticker, 0)
        if price <= 0:
            continue

        current_qty = positions.get(ticker, {}).get('qty', 0)
        if current_qty <= 0:
            continue

        current_value = current_qty * price
        target_value = target_values[ticker]
        excess_value = current_value - target_value

        if excess_value > 0:
            qty_sell = int(excess_value / price)
            qty_sell = (qty_sell // LOT_SIZE) * LOT_SIZE
            if qty_sell <= 0:
                continue

            trade_value = qty_sell * price
            if MIN_TRADE_VALUE and trade_value < MIN_TRADE_VALUE:
                continue

            self.pending_sell_orders.append({
                "order_type": "SELL",
                "ticker": ticker,
                "date": current_date,
                "price": price,
                "qty": qty_sell,
                "status": "PENDING",
                "account_id": account_id,
                "note": "Trim excess allocation",
                "order_type_db": "MP",
            })
            sell_proceeds += trade_value

    # === BUY PHASE ===
    buffer_cash = nav * MIN_CASH_PCT

    if self.p.use_sell_proceeds_for_buys:
        buy_budget = max(0.0, min(current_cash, sell_proceeds) - buffer_cash)
    else:
        buy_budget = max(0.0, current_cash - buffer_cash)

    # 6. Calculate deficits
    deficits = []
    for ticker, target_weight in target_weights.items():
        price = prices.get(ticker, 0)
        if price <= 0:
            continue

        current_qty = positions.get(ticker, {}).get('qty', 0)
        current_value = current_qty * price
        target_value = target_values[ticker]
        deficit = target_value - current_value

        if deficit > 0:
            deficits.append((ticker, deficit, price))

    # Sort by deficit (largest first)
    deficits.sort(key=lambda x: x[1], reverse=True)

    # 7. Fill deficits
    for ticker, deficit, price in deficits:
        if buy_budget <= 0:
            break

        qty_buy = int(min(deficit, buy_budget) / price)
        qty_buy = (qty_buy // LOT_SIZE) * LOT_SIZE
        if qty_buy <= 0:
            continue

        trade_value = qty_buy * price
        if MIN_TRADE_VALUE and trade_value < MIN_TRADE_VALUE:
            continue

        self.pending_buy_orders.append({
            "order_type": "BUY",
            "ticker": ticker,
            "date": current_date,
            "price": price,
            "qty": qty_buy,
            "status": "PENDING",
            "account_id": account_id,
            "note": "Fill deficit allocation",
            "order_type_db": "LO",
        })
        buy_budget -= trade_value
```

---

### 5. Order & Trade Processing

#### 5.1 Persist Orders

**File:** `funct/db_core.py::save_orders()`

```python
def save_orders(order_type, ticker, date, price, qty, status, account_id,
                note=None, order_type_db=None, order_seq=None):
    """
    Lưu order vào PostgreSQL orders table
    """
    conn = psycopg2.connect(DatabaseConfig.get_connection_string())
    cur = conn.cursor()

    # Calculate created_at with +7 timezone
    base_time = datetime.combine(date, datetime.strptime('14:01', '%H:%M').time())
    if order_seq is not None:
        created_at = base_time + timedelta(seconds=30 * order_seq)
    else:
        created_at = datetime.combine(date, datetime.min.time())
    created_at = created_at.replace(tzinfo=pytz.timezone('Asia/Bangkok'))

    # Insert order
    sql = """
        INSERT INTO orders (account_id, symbol, type, qty, price, status,
                          created_at, updated_at, order_type, note)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cur.execute(sql, (
        account_id, ticker, order_type, qty, price, status,
        created_at, created_at, order_type_db or order_type, note or ''
    ))
    conn.commit()

    # Return order_id
    cur.execute("SELECT LASTVAL()")
    order_id = cur.fetchone()[0]

    return order_id
```

**Orders table schema:**

```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL,  -- 'BUY' or 'SELL'
    qty INTEGER NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'PENDING', 'FILLED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_type VARCHAR(10),  -- 'MP' (market), 'LO' (limit), etc.
    note TEXT
);
```

#### 5.2 Process Daily Trades

**File:** `core/trade_processor.py::process_daily_trades()`

```python
def process_daily_trades(date, account_id, TradingConfig, DatabaseConfig,
                        next_date=None, price_data_df=None):
    """
    Xử lý orders thành trades, update positions và cashbalance

    Flow:
    1. Find PENDING orders chưa có trade
    2. Execute orders theo thứ tự (SELL trước, BUY sau)
    3. Validate orders (holding days, cash available, etc.)
    4. Create trades
    5. Update positions for next_date
    6. Update cashbalance for next_date
    """

    conn = psycopg2.connect(DatabaseConfig.get_connection_string())
    cur = conn.cursor()

    # 1. Lấy cashbalance hiện tại
    cur.execute("""
        SELECT balance, nextday_amt FROM cashbalance
        WHERE account_id = %s AND datadate = %s
        ORDER BY datadate DESC LIMIT 1
    """, (account_id, date))
    latest_balance = cur.fetchone()

    if not latest_balance:
        # Initialize with default cash
        balance = TradingConfig.DEFAULT_INITIAL_CASH
        nextday_amt = 0
    else:
        balance, nextday_amt = latest_balance

    # 2. Get PENDING orders without trades (SELL first, then BUY)
    cur.execute("""
        SELECT o.order_id, o.account_id, o.symbol, o.type, o.qty, o.price,
               o.status, o.order_type
        FROM orders o
        LEFT JOIN trades t ON o.order_id = t.order_id
        WHERE DATE(o.created_at) = %s
          AND t.order_id IS NULL
          AND o.status IN ('PENDING', 'FILLED')
        ORDER BY o.type DESC, o.order_id ASC  -- SELL first
    """, (date,))
    orders = cur.fetchall()

    # 3. Execute orders
    available_cash = balance + nextday_amt
    sell_proceeds_today = 0.0

    for order in orders:
        order_id, acc_id, symbol, order_type, qty, price, status, order_type_db = order

        if order_type == 'SELL':
            # Validate: check available qty in positions
            cur.execute("""
                SELECT qty, available_qty FROM positions
                WHERE account_id = %s AND symbol = %s AND datadate = %s
            """, (acc_id, symbol, date))
            pos = cur.fetchone()

            if not pos or pos[1] < qty:
                logger.warning(f"SELL order {order_id}: insufficient available qty")
                continue

            # Create trade
            trade_value = qty * price
            fee = trade_value * TradingConfig.SELL_FEE_RATE

            cur.execute("""
                INSERT INTO trades (order_id, account_id, symbol, qty, price,
                                   trade_time, fee, trade_value, type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (order_id, acc_id, symbol, qty, price,
                  datetime.combine(date, datetime.strptime('14:01', '%H:%M').time()),
                  fee, trade_value, 'SELL'))

            # Update sell proceeds (available for BUY on next_date)
            sell_proceeds_today += (trade_value - fee)

        elif order_type == 'BUY':
            # Validate: check available cash
            trade_value = qty * price
            fee = trade_value * TradingConfig.BUY_FEE_RATE
            total_cost = trade_value + fee

            if available_cash < total_cost:
                logger.warning(f"BUY order {order_id}: insufficient cash")
                continue

            # Create trade
            cur.execute("""
                INSERT INTO trades (order_id, account_id, symbol, qty, price,
                                   trade_time, fee, trade_value, type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (order_id, acc_id, symbol, qty, price,
                  datetime.combine(date, datetime.strptime('14:01', '%H:%M').time()),
                  fee, trade_value, 'BUY'))

            # Deduct cash
            available_cash -= total_cost

    conn.commit()

    # 4. Update positions for next_date
    if next_date:
        _update_positions(cur, account_id, date, next_date)
        _update_cashbalance(cur, account_id, date, next_date, sell_proceeds_today)
        conn.commit()

    cur.close()
    conn.close()
    return True
```

**Logic update positions:**

```python
def _update_positions(cur, account_id, date, next_date):
    """
    Copy positions from 'date' to 'next_date', apply today's trades
    """
    # Copy today's positions to next_date
    cur.execute("""
        INSERT INTO positions (account_id, symbol, qty, avg_price, datadate,
                              available_qty, nextday_qty)
        SELECT account_id, symbol, qty, avg_price, %s, qty, 0
        FROM positions
        WHERE account_id = %s AND datadate = %s
    """, (next_date, account_id, date))

    # Apply SELL trades (reduce qty)
    cur.execute("""
        UPDATE positions p
        SET qty = p.qty - t.qty,
            available_qty = p.available_qty - t.qty
        FROM (
            SELECT symbol, SUM(qty) as qty
            FROM trades
            WHERE account_id = %s AND DATE(trade_time) = %s AND type = 'SELL'
            GROUP BY symbol
        ) t
        WHERE p.account_id = %s AND p.symbol = t.symbol AND p.datadate = %s
    """, (account_id, date, account_id, next_date))

    # Apply BUY trades (add to nextday_qty, update avg_price)
    cur.execute("""
        UPDATE positions p
        SET nextday_qty = COALESCE(p.nextday_qty, 0) + t.qty,
            avg_price = ((p.qty * p.avg_price) + (t.qty * t.avg_price)) / (p.qty + t.qty)
        FROM (
            SELECT symbol, SUM(qty) as qty, AVG(price) as avg_price
            FROM trades
            WHERE account_id = %s AND DATE(trade_time) = %s AND type = 'BUY'
            GROUP BY symbol
        ) t
        WHERE p.account_id = %s AND p.symbol = t.symbol AND p.datadate = %s
    """, (account_id, date, account_id, next_date))
```

**Logic update cashbalance:**

```python
def _update_cashbalance(cur, account_id, date, next_date, sell_proceeds):
    """
    Copy cashbalance to next_date, apply trades
    """
    # Get today's balance
    cur.execute("""
        SELECT balance, nextday_amt FROM cashbalance
        WHERE account_id = %s AND datadate = %s
    """, (account_id, date))
    balance, nextday_amt = cur.fetchone()

    # Calculate BUY total cost
    cur.execute("""
        SELECT SUM(trade_value + fee) FROM trades
        WHERE account_id = %s AND DATE(trade_time) = %s AND type = 'BUY'
    """, (account_id, date))
    buy_cost = cur.fetchone()[0] or 0

    # Insert next_date cashbalance
    new_balance = balance + nextday_amt - buy_cost
    new_nextday_amt = sell_proceeds

    cur.execute("""
        INSERT INTO cashbalance (account_id, datadate, balance, nextday_amt)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (account_id, datadate)
        DO UPDATE SET balance = EXCLUDED.balance, nextday_amt = EXCLUDED.nextday_amt
    """, (account_id, next_date, new_balance, new_nextday_amt))
```

---

## 🎛️ Các Mode Chạy Backtest

### Mode 1: `bt_db` - Pure Historical Backtest

**Config:**
```python
CORE_SOURCE = 'bt_db'
TimeConfig.BT_DATE_RANGE = {
    'from_date': datetime(2020, 9, 1).date(),
    'to_date': datetime(2025, 10, 1).date(),
}
```

**Đặc điểm:**
- Chạy backtest trên historical data từ DB
- Không cần real-time data
- Sử dụng `price_adj_closed` làm `market_check_price`
- Tự động stop khi đến `to_date`

**Use case:**
- Research & development strategies
- Parameter optimization
- Performance analysis

---

### Mode 2: `db` - DB Forward Testing

**Config:**
```python
CORE_SOURCE = 'db'
TimeConfig.DB_MODE_START_DATE = datetime(2025, 9, 1).date()
```

**Đặc điểm:**
- Chạy forward test từ `DB_MODE_START_DATE` đến hôm nay
- Load historical data từ DB
- Load market_check_price từ FiinQuant API
- Tự động stop khi đến hôm nay

**Use case:**
- Paper trading simulation
- Pre-production testing

---

### Mode 3: `fw_db` - Forward DB with Real-time Data

**Config:**
```python
CORE_SOURCE = 'fw_db'
CURRENT_MODE = 'hybrid'  # hoặc 'fiin_only'
FWDBConfig.WAIT_FOR_FUTURE = True
FWDBConfig.CURRENT_DAY_ONLY = True
```

**Đặc điểm:**
- Kết hợp historical data (Trino) + today's data (FiinQuant)
- Wait until `MARKET_CHECK_TIME + 6 minutes` (13:55 + 6m)
- Validate giá real-time (max 7% deviation)
- Cleanup DB theo `CLEANUP_RULES`

**DB Cleanup Rules:**
```python
FWDBConfig.CLEANUP_RULES = {
    'orders_trades': 'today',      # Xóa orders/trades từ today trở đi
    'cash_positions': 'after_today'  # Xóa cash/positions sau today
}
```

**Use case:**
- Live trading preparation
- Daily strategy execution with real-time data

---

### Mode 4: `api` - Live Trading

**Config:**
```python
CORE_SOURCE = 'api'
FIIN_CONFIG = {
    'username': 'your_username',
    'password': 'your_password'
}
```

**Đặc điểm:**
- Chạy hàng ngày, chỉ xử lý ngày hiện tại
- Fetch real-time data từ FiinQuant API
- Execute orders qua API (chưa implement trong template)
- Auto-stop sau khi chạy xong ngày hiện tại

**Use case:**
- Production live trading

---

## 📈 Data Sources & Processing

### Trino DB Schema

**Table:** `iceberg.dwh_atomic.dwh_market_prices_and_transactions_securities_daily_prices`

```sql
CREATE TABLE dwh_market_prices_and_transactions_securities_daily_prices (
    stock_exchange_unique_id VARCHAR(10),
    ticker VARCHAR(10),
    organ_code VARCHAR(20),
    transdate DATE,
    price_floor DECIMAL(18, 2),
    price_opened DECIMAL(18, 2),
    price_highest DECIMAL(18, 2),
    price_lowest DECIMAL(18, 2),
    price_closed DECIMAL(18, 2),
    price_reference DECIMAL(18, 2),
    volume_total BIGINT,
    is_deleted INTEGER
)
```

**Table:** `iceberg.mart_common.fact_securities_daily_priceadjusted_history`

```sql
CREATE TABLE fact_securities_daily_priceadjusted_history (
    ticker VARCHAR(10),
    transdate DATE,
    price_adjusted DECIMAL(18, 2),
    price_closed DECIMAL(18, 2),
    is_deleted INTEGER
)
```

### FiinQuant API

**Methods:**

```python
from data.fiin_price_loader import FiinPriceLoader

loader = FiinPriceLoader(username='...', password='...')

# 1. Get historical price at specific time
df = loader.get_historical_price_at_time(
    tickers=['HPG', 'VHM'],
    start_date=datetime(2025, 9, 1).date(),
    end_date=datetime(2025, 12, 24).date(),
    time_str="13:55"
)

# 2. Get today's price at specific time
df = loader.get_price_at_time(
    tickers=['HPG', 'VHM'],
    check_time=datetime.now().replace(hour=13, minute=55)
)

# 3. Get 5-minute bars
data = loader.client.Fetch_Trading_Data(
    tickers=['HPG'],
    by='5m',
    from_date='2025-01-01 09:00:00',
    to_date='2025-12-24 15:00:00',
    adjusted=True
)
```

---

## 🛠️ Troubleshooting

### Issue 1: No data for ticker

**Error:**
```
Skipping HPG: Error preparing data feed: No data available
```

**Nguyên nhân:**
- Ticker không có trong historical data
- Không đủ bars (< max_indicator_period)

**Fix:**
```python
# Check data length
data_lengths = df_hist.groupby('ticker').size()
print(data_lengths[data_lengths < 50])  # List tickers with < 50 bars
```

### Issue 2: Duplicate transdate

**Error:**
```
Found 15 duplicate records - removing duplicates
```

**Nguyên nhân:**
- Merge historical + today's data tạo duplicates
- FiinQuant API trả về dữ liệu trùng

**Fix:** Đã được xử lý tự động trong `CSVDataFeed.__init__()`:
```python
self.df_hist = self.df_hist.drop_duplicates(
    subset=['ticker', 'transdate'],
    keep='first'
)
```

### Issue 3: Cashbalance missing

**Error:**
```
No existing cashbalance records found in the system
```

**Nguyên nhân:**
- DB chưa được initialize
- `process_daily_trades` chưa chạy cho ngày đầu tiên

**Fix:**
```python
# Initialize cashbalance cho account
INSERT INTO cashbalance (account_id, datadate, balance, nextday_amt)
VALUES ('ACC001', '2024-09-01', 10000000000, 0);

# Initialize positions (empty)
-- No records needed if starting fresh
```

### Issue 4: Order validation failed

**Error:**
```
BUY order 123: insufficient cash
SELL order 124: insufficient available qty
```

**Nguyên nhân:**
- Cash không đủ cho BUY orders
- Positions không đủ available_qty cho SELL

**Debug:**
```python
# Check cashbalance
SELECT * FROM cashbalance
WHERE account_id = 'ACC001' AND datadate = '2025-12-24';

# Check positions
SELECT * FROM positions
WHERE account_id = 'ACC001' AND datadate = '2025-12-24';
```

### Issue 5: Price validation failed

**Error:**
```
After price validation: 0 tickers remaining
```

**Nguyên nhân:**
- All tickers có giá lệch > 7% so với reference price

**Fix:**
```python
# Adjust max deviation
FWDBConfig.PRICE_VALIDATION['max_deviation'] = 0.10  # 10%

# Or disable validation
FWDBConfig.PRICE_VALIDATION['enabled'] = False
```

---

## 📝 Best Practices

### 1. Data Quality

```python
# Always validate data before backtest
assert not df_hist.isnull().any().any(), "Historical data contains NaN"
assert (df_hist['price_closed'] > 0).all(), "Invalid prices detected"
assert not df_hist.duplicated(['ticker', 'transdate']).any(), "Duplicates found"
```

### 2. Logging

```python
# Use structured logging
logger.info(f"[{ticker}] Processing date: {current_date}, price: {price}")

# Log important decisions
logger.info(f"Rebalance triggered: {current_date}, target_weights: {target_weights}")
```

### 3. Error Handling

```python
try:
    df_hist = pd.read_sql(sql_query, connection)
except Exception as e:
    logger.error(f"DB query failed: {e}. Trying CSV fallback...")
    df_hist = pd.read_csv(HISTORICAL_DATA_CSV)
```

### 4. Performance

```python
# Use vectorized operations
df_hist['market_check_price'] = df_hist.groupby('ticker')['market_check_price'].fillna(method='ffill')

# Avoid loops in pandas
# BAD:
for i, row in df.iterrows():
    df.loc[i, 'new_col'] = row['col1'] * row['col2']

# GOOD:
df['new_col'] = df['col1'] * df['col2']
```

---

## 📚 References

- **Backtrader Documentation:** https://www.backtrader.com/docu/
- **FiinQuant API:** (Internal docs)
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Tài liệu này được tạo bởi:** Claude Code (Sonnet 4.5)
**Liên hệ:** [Thêm thông tin contact nếu cần]
