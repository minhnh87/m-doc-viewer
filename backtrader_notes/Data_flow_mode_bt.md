# Last Talk - backtrader-v3
Updated: 20260106_212750

---

## User

Cho ví dụ cụ thể về data input, output tại từng step của flow trong ảnh

---

## Claude

## Ví dụ Data Input/Output tại từng Step

---

### **Step 1: Trino (Iceberg) → TrinoDailyLoader**

**Input:** SQL Query gửi đến Trino
```sql
-- TrinoDailyLoader gửi query này
SELECT ticker, transdate, price_adj_closed, price_adj_opened,
       price_closed, price_opened, price_reference, volume_total
FROM market_insight_securities_daily_prices
WHERE transdate >= '2024-01-02' AND transdate <= '2024-01-05'
  AND ticker IN ('VNM','VIC','HPG')
ORDER BY transdate ASC
```

**Output:** Raw result từ Trino (dạng cursor/rows)
```
┌────────┬────────────┬─────────────────┬─────────────────┬──────────────┬──────────────┬─────────────────┬──────────────┐
│ ticker │ transdate  │ price_adj_closed│ price_adj_opened│ price_closed │ price_opened │ price_reference │ volume_total │
├────────┼────────────┼─────────────────┼─────────────────┼──────────────┼──────────────┼─────────────────┼──────────────┤
│ VNM    │ 2024-01-02 │ 72500           │ 72000           │ 72500        │ 72000        │ 71800           │ 1234500      │
│ VNM    │ 2024-01-03 │ 73200           │ 72600           │ 73200        │ 72600        │ 72500           │ 1456000      │
│ VNM    │ 2024-01-04 │ 72800           │ 73100           │ 72800        │ 73100        │ 73200           │ 987600       │
│ VNM    │ 2024-01-05 │ 73500           │ 72900           │ 73500        │ 72900        │ 72800           │ 1567800      │
│ VIC    │ 2024-01-02 │ 42300           │ 42000           │ 42300        │ 42000        │ 41800           │ 2345600      │
│ VIC    │ 2024-01-03 │ 42800           │ 42400           │ 42800        │ 42400        │ 42300           │ 2567000      │
│ VIC    │ 2024-01-04 │ 42500           │ 42700           │ 42500        │ 42700        │ 42800           │ 1890000      │
│ VIC    │ 2024-01-05 │ 43100           │ 42600           │ 43100        │ 42600        │ 42500           │ 2678900      │
│ HPG    │ 2024-01-02 │ 27800           │ 27500           │ 27800        │ 27500        │ 27300           │ 5678900      │
│ HPG    │ 2024-01-03 │ 28200           │ 27900           │ 28200        │ 27900        │ 27800           │ 6123400      │
│ HPG    │ 2024-01-04 │ 27900           │ 28100           │ 27900        │ 28100        │ 28200           │ 4567800      │
│ HPG    │ 2024-01-05 │ 28500           │ 28000           │ 28500        │ 28000        │ 27900           │ 5890100      │
└────────┴────────────┴─────────────────┴─────────────────┴──────────────┴──────────────┴─────────────────┴──────────────┘
```

---

### **Step 2: TrinoDailyLoader → DataFrame (pandas)**

**Input:** Raw Trino result (từ Step 1)

**Processing:**
```python
# Trong TrinoDailyLoader.load_historical()
df = pd.read_sql(sql_query, connection)
df['transdate'] = pd.to_datetime(df['transdate'])
```

**Output:** pandas DataFrame
```python
>>> df
    ticker  transdate   price_adj_closed  price_adj_opened  price_closed  price_opened  price_reference  volume_total
0   VNM     2024-01-02  72500             72000             72500         72000         71800            1234500
1   VNM     2024-01-03  73200             72600             73200         72600         72500            1456000
2   VNM     2024-01-04  72800             73100             72800         73100         73200            987600
3   VNM     2024-01-05  73500             72900             73500         72900         72800            1567800
4   VIC     2024-01-02  42300             42000             42300         42000         41800            2345600
5   VIC     2024-01-03  42800             42400             42800         42400         42300            2567000
6   VIC     2024-01-04  42500             42700             42500         42700         42800            1890000
7   VIC     2024-01-05  43100             42600             43100         42600         42500            2678900
8   HPG     2024-01-02  27800             27500             27800         27500         27300            5678900
9   HPG     2024-01-03  28200             27900             28200         27900         27800            6123400
10  HPG     2024-01-04  27900             28100             27900         28100         28200            4567800
11  HPG     2024-01-05  28500             28000             28500         28000         27900            5890100

>>> df.dtypes
ticker              object
transdate           datetime64[ns]
price_adj_closed    int64
price_adj_opened    int64
price_closed        int64
price_opened        int64
price_reference     int64
volume_total        int64
```

---

### **Step 3: DataFrame → Filter by ticker**

**Input:** Full DataFrame (12 rows, 3 tickers)

**Processing:** (trong CSVDataFeed.__init__)
```python
# Với ticker = 'VNM'
self.df_hist = self.p.df_hist[self.p.df_hist['ticker'] == 'VNM'].copy()
self.df_hist = self.df_hist.sort_values(by='transdate').reset_index(drop=True)
```

**Output:** 3 DataFrames riêng biệt (mỗi ticker 1 DataFrame)

**VNM DataFrame:**
```python
>>> df_vnm
   ticker  transdate   price_adj_closed  price_adj_opened  price_closed  price_opened  price_reference  volume_total
0  VNM     2024-01-02  72500             72000             72500         72000         71800            1234500
1  VNM     2024-01-03  73200             72600             73200         72600         72500            1456000
2  VNM     2024-01-04  72800             73100             72800         73100         73200            987600
3  VNM     2024-01-05  73500             72900             73500         72900         72800            1567800
```

**VIC DataFrame:**
```python
>>> df_vic
   ticker  transdate   price_adj_closed  price_adj_opened  price_closed  price_opened  price_reference  volume_total
0  VIC     2024-01-02  42300             42000             42300         42000         41800            2345600
1  VIC     2024-01-03  42800             42400             42800         42400         42300            2567000
2  VIC     2024-01-04  42500             42700             42500         42700         42800            1890000
3  VIC     2024-01-05  43100             42600             43100         42600         42500            2678900
```

**HPG DataFrame:**
```python
>>> df_hpg
   ticker  transdate   price_adj_closed  price_adj_opened  price_closed  price_opened  price_reference  volume_total
0  HPG     2024-01-02  27800             27500             27800         27500         27300            5678900
1  HPG     2024-01-03  28200             27900             28200         27900         27800            6123400
2  HPG     2024-01-04  27900             28100             27900         28100         28200            4567800
3  HPG     2024-01-05  28500             28000             28500         28000         27900            5890100
```

---

### **Step 4: Filter by ticker → CSVDataFeed (per ticker)**

**Input:** Filtered DataFrame (VNM)

**Processing:** (trong CSVDataFeed._load() - mỗi lần gọi load 1 bar)
```python
def _load(self):
    row = self.df.iloc[self.last_index]
    
    self.lines.datetime[0] = bt.date2num(row['transdate'])  # Convert to backtrader format
    self.lines.open[0] = row['price_adj_opened']
    self.lines.close[0] = row['price_adj_closed']
    self.lines.price_opened[0] = row['price_opened']
    self.lines.price_closed[0] = row['price_closed']
    self.lines.price_reference[0] = row['price_reference']
    # ... more fields
```

**Output:** Backtrader Data Lines (per bar)

```
CSVDataFeed cho VNM:
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Backtrader Lines Object                               │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│   datetime  │    open     │    close    │ price_opened│price_closed │  ref   │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼────────┤
│ 738886.0    │ 72000       │ 72500       │ 72000       │ 72500       │ 71800  │  ← Bar 0 (2024-01-02)
│ 738887.0    │ 72600       │ 73200       │ 72600       │ 73200       │ 72500  │  ← Bar 1 (2024-01-03)
│ 738888.0    │ 73100       │ 72800       │ 73100       │ 72800       │ 73200  │  ← Bar 2 (2024-01-04)
│ 738889.0    │ 72900       │ 73500       │ 72900       │ 73500       │ 72800  │  ← Bar 3 (2024-01-05)
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴────────┘
                    ↑
          Giá điều chỉnh (adj)        Giá gốc (non-adj)
```

---

### **Step 5: CSVDataFeed → Backtrader Cerebro**

**Input:** 3 CSVDataFeed objects (VNM, VIC, HPG)

**Processing:** (trong BacktestRunner._setup_cerebro)
```python
cerebro = bt.Cerebro()

# Add strategy
cerebro.addstrategy(QPMMTStrategy, results_dir=str(self.results_dir))

# Add data feeds
for ticker in ['VNM', 'VIC', 'HPG']:
    feed = CSVDataFeed(df_hist=df, ticker=ticker, name=ticker)
    cerebro.adddata(feed, name=ticker)

cerebro.broker.setcash(1_000_000_000)  # 1 tỷ VND
```

**Output:** Cerebro với strategy có thể truy cập data

```python
# Trong Strategy.next() - mỗi bar
class QPMMTStrategy(BaseStrategy):
    def next(self):
        current_date = self.datetime.date(0)  # 2024-01-02
        
        for d in self.datas:  # [VNM, VIC, HPG]
            ticker = d.p.ticker
            
            # Truy cập data lines
            close = d.close[0]           # Giá đóng cửa hôm nay
            prev_close = d.close[-1]     # Giá đóng cửa hôm qua
            open_price = d.open[0]       # Giá mở cửa
            ref_price = d.price_reference[0]  # Giá tham chiếu
            
            print(f"{ticker}: close={close}, open={open_price}, ref={ref_price}")
```

**Console output khi chạy:**
```
2024-01-02:
  VNM: close=72500, open=72000, ref=71800
  VIC: close=42300, open=42000, ref=41800
  HPG: close=27800, open=27500, ref=27300

2024-01-03:
  VNM: close=73200, open=72600, ref=72500
  VIC: close=42800, open=42400, ref=42300
  HPG: close=28200, open=27900, ref=27800

2024-01-04:
  VNM: close=72800, open=73100, ref=73200
  VIC: close=42500, open=42700, ref=42800
  HPG: close=27900, open=28100, ref=28200

2024-01-05:
  VNM: close=73500, open=72900, ref=72800
  VIC: close=43100, open=42600, ref=42500
  HPG: close=28500, open=28000, ref=27900
```

---

### **Tổng hợp Data Flow**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Trino Query                                                            │
│  Input:  SQL string + connection                                                │
│  Output: 12 raw rows (3 tickers × 4 days)                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  STEP 2: TrinoDailyLoader                                                       │
│  Input:  12 raw rows                                                            │
│  Output: pandas DataFrame (12 rows, 8 columns)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  STEP 3: Filter by ticker                                                       │
│  Input:  DataFrame (12 rows)                                                    │
│  Output: 3 DataFrames (4 rows each) - df_vnm, df_vic, df_hpg                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  STEP 4: CSVDataFeed                                                            │
│  Input:  3 filtered DataFrames                                                  │
│  Output: 3 Backtrader data feed objects với lines (datetime, open, close, ...)  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  STEP 5: Cerebro                                                                │
│  Input:  3 data feeds + Strategy class                                          │
│  Output: Strategy instance có thể iterate qua bars và access data               │
│          → d.close[0], d.open[0], d.price_reference[0], ...                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

