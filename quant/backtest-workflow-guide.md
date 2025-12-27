# Backtest Trading Strategy - Complete Workflow Guide

## Overview

Backtesting là quy trình kiểm tra hiệu quả của một chiến thuật trading trên dữ liệu lịch sử trước khi áp dụng vào thị trường thực. Document này mô tả chi tiết từng bước trong quy trình backtest chuyên nghiệp.

---

## Flow Tổng Quan

```
[1. Strategy Design] → [2. Data Preparation] → [3. Backtest Setup]
        ↓                                              ↓
[4. Execution] → [5. Performance Analysis] → [6. Validation]
        ↓                                              ↓
[7. Optimization] ←──────────────────────────────────→ [8. Go Live]
```

---

## Phase 1: Strategy Design (Thiết kế chiến thuật)

### 1.1 Define Hypothesis (Định nghĩa giả thuyết)
- Xác định ý tưởng trading cụ thể
- Ví dụ: "VN30 mean-reverts khi có spike > 1% trong ngày"
- Phải có cơ sở logic, không phải random

### 1.2 Define Clear Rules (Quy tắc rõ ràng)
| Component | Description | Example |
|-----------|-------------|---------|
| **Entry Signal** | Điều kiện vào lệnh | EMA(9) cắt lên EMA(21) |
| **Exit Signal** | Điều kiện thoát lệnh | EMA(9) cắt xuống EMA(21) |
| **Stop Loss** | Cắt lỗ | -2% từ giá entry |
| **Take Profit** | Chốt lời | +4% từ giá entry |
| **Position Size** | Khối lượng | 2% risk per trade |
| **Filters** | Điều kiện lọc | Chỉ trade khi RSI < 70 |

### 1.3 Strategy Parameters
```yaml
parameters:
  fast_period: 9
  slow_period: 21
  rsi_period: 14
  rsi_overbought: 70
  rsi_oversold: 30
  stop_loss_pct: 0.02
  take_profit_pct: 0.04
  risk_per_trade: 0.02
```

---

## Phase 2: Data Preparation (Chuẩn bị dữ liệu)

### 2.1 Data Collection
| Data Type | Source | Use Case |
|-----------|--------|----------|
| Daily/EOD | Yahoo Finance, VNDirect | Swing trading |
| Minute/Tick | Broker API, CryptoCompare | Intraday trading |
| Fundamental | Financial reports | Factor investing |

### 2.2 Data Quality Checks
- [ ] Missing values handling
- [ ] Outlier detection
- [ ] Data continuity verification
- [ ] Timezone consistency

### 2.3 Data Adjustments
```python
# Các điều chỉnh cần thiết:
adjustments = {
    "splits": True,          # Chia tách cổ phiếu
    "dividends": True,       # Cổ tức
    "bonus": True,           # Thưởng cổ phiếu
    "rights": True,          # Quyền mua
    "continuous_futures": True  # Roll futures contracts
}
```

### 2.4 Survivorship Bias Prevention
- Sử dụng historical index constituents
- Bao gồm delisted stocks
- Không chỉ test trên winners hiện tại

---

## Phase 3: Backtest Setup (Thiết lập backtest)

### 3.1 Time Period Selection
```
|<-------- In-Sample (Training) ------->|<-- Out-of-Sample (Testing) -->|
|           70% data                     |           30% data            |
|        2018-01-01 to 2022-12-31       |     2023-01-01 to 2024-12-31  |
```

### 3.2 Initial Capital & Position Sizing
```yaml
capital:
  initial: 100,000,000  # VND
  leverage: 1.0         # No margin
  max_positions: 5      # Tối đa 5 vị thế
  position_size_method: "risk_parity"  # or "equal_weight"
```

### 3.3 Transaction Costs Configuration
| Cost Type | Vietnam Market | Crypto |
|-----------|---------------|--------|
| Brokerage | 0.15% - 0.25% | 0.1% |
| Tax (STT) | 0.1% sell-side | 0% |
| Slippage | 0.05% - 0.1% | 0.05% |
| Exchange fee | Included | 0.01% |

---

## Phase 4: Backtest Execution (Chạy backtest)

### 4.1 Event-Driven Loop
```
FOR each bar in historical_data:
    1. Update market data
    2. Calculate indicators
    3. Generate signals
    4. Check risk management rules
    5. Execute orders (with slippage)
    6. Update portfolio
    7. Record trade log
    8. Calculate equity curve
END FOR
```

### 4.2 Order Execution Simulation
```python
def execute_order(signal, price, volume):
    # Simulate realistic execution
    slippage = price * 0.0005  # 0.05%

    if signal == "BUY":
        fill_price = price + slippage
    else:
        fill_price = price - slippage

    commission = fill_price * volume * 0.002  # 0.2%

    return fill_price, commission
```

### 4.3 Avoid Common Biases
| Bias | Problem | Solution |
|------|---------|----------|
| **Look-ahead** | Dùng data tương lai | Signal từ bar trước, trade bar sau |
| **Survivorship** | Chỉ test stock còn sống | Dùng historical constituents |
| **Data snooping** | Overfitting parameters | Walk-forward validation |

---

## Phase 5: Performance Analysis (Phân tích hiệu suất)

### 5.1 Return Metrics
| Metric | Formula | Good Value |
|--------|---------|------------|
| **Total Return** | (Final - Initial) / Initial | > Market return |
| **CAGR** | (Final/Initial)^(1/years) - 1 | > 15% |
| **Monthly Return** | Avg monthly % | > 1% |

### 5.2 Risk Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| **Max Drawdown** | Largest peak-to-trough decline | < 20% |
| **Volatility** | Std dev of returns (annualized) | < 20% |
| **VaR 95%** | Value at Risk | < 2% daily |

### 5.3 Risk-Adjusted Returns
| Metric | Formula | Good Value |
|--------|---------|------------|
| **Sharpe Ratio** | (Return - Rf) / Volatility | > 1.0 |
| **Sortino Ratio** | (Return - Rf) / Downside Dev | > 1.5 |
| **Calmar Ratio** | CAGR / Max Drawdown | > 1.0 |

### 5.4 Trade Statistics
```yaml
trade_stats:
  total_trades: 150
  win_rate: 55%
  avg_win: 3.2%
  avg_loss: -1.8%
  profit_factor: 1.95  # gross_profit / gross_loss
  avg_holding_period: 5 days
  max_consecutive_wins: 8
  max_consecutive_losses: 5
```

### 5.5 Sample Performance Report
```
============================================
        BACKTEST PERFORMANCE REPORT
============================================
Period: 2020-01-01 to 2024-12-31
Initial Capital: 100,000,000 VND
Final Capital: 185,000,000 VND

RETURNS
-------
Total Return: 85.00%
CAGR: 16.54%
Best Month: +8.5%
Worst Month: -6.2%

RISK
----
Max Drawdown: -15.3%
Volatility (Ann.): 18.5%
VaR 95%: -1.8%

RISK-ADJUSTED
-------------
Sharpe Ratio: 1.25
Sortino Ratio: 1.68
Calmar Ratio: 1.08

TRADES
------
Total Trades: 156
Win Rate: 58%
Profit Factor: 2.1
Avg Trade: +0.54%
============================================
```

---

## Phase 6: Validation (Xác nhận kết quả)

### 6.1 Train/Test Split
```
Training Set (In-Sample):    70% đầu tiên
Testing Set (Out-of-Sample): 30% còn lại

QUAN TRỌNG: KHÔNG được tối ưu trên test set!
```

### 6.2 Walk-Forward Analysis
```
|-- Train 1 --|-- Test 1 --|
      |-- Train 2 --|-- Test 2 --|
            |-- Train 3 --|-- Test 3 --|
                  |-- Train 4 --|-- Test 4 --|

→ Aggregate Test results = Final Performance
```

### 6.3 Monte Carlo Simulation
- Shuffle trade sequence 1000+ lần
- Xem distribution của returns
- Evaluate worst-case scenarios
- Confidence interval cho metrics

### 6.4 Robustness Checks
| Test | Purpose |
|------|---------|
| Parameter sensitivity | Thay đổi ±10% params, kết quả có ổn định? |
| Different markets | Test trên các stocks/markets khác |
| Different periods | Test trên bull/bear/sideways markets |
| Stress test | Test với extreme events (2020 COVID crash) |

---

## Phase 7: Optimization (Tối ưu hóa)

### 7.1 Parameter Optimization
```python
# Grid Search Example
param_grid = {
    'fast_period': [5, 9, 12, 15],
    'slow_period': [20, 21, 25, 30],
    'rsi_period': [10, 14, 20]
}

# CẢNH BÁO: Avoid overfitting!
# Sử dụng walk-forward để validate
```

### 7.2 Overfitting Prevention
- Giữ số parameters tối thiểu
- Sử dụng cross-validation
- Test out-of-sample performance
- Prefer robust strategies over optimal ones

### 7.3 When to Stop Optimizing
- Sharpe > 1.0 out-of-sample
- Strategy logic makes sense
- Results stable across time periods
- Transaction costs included

---

## Phase 8: Go Live (Triển khai thực tế)

### 8.1 Paper Trading
```
Duration: Minimum 1-3 months
Purpose: Validate in real-time conditions
Track: Slippage, execution quality, psychology
```

### 8.2 Live Trading Checklist
- [ ] Paper trading successful
- [ ] Risk management rules set
- [ ] Emergency stop procedures defined
- [ ] Capital allocation decided
- [ ] Monitoring dashboard ready

### 8.3 Position Sizing for Live
```yaml
live_config:
  initial_allocation: 10%  # Của total capital
  scale_up_after: 3 months profitable
  max_allocation: 30%
  stop_trading_drawdown: -10%
```

### 8.4 Continuous Monitoring
| Metric | Frequency | Action Threshold |
|--------|-----------|------------------|
| Daily P&L | Daily | > -2% review |
| Drawdown | Daily | > -10% pause |
| Win rate | Weekly | < 40% review |
| Sharpe | Monthly | < 0.5 stop |

---

## Tools & Frameworks

### Python Libraries
| Library | Use Case |
|---------|----------|
| **Backtrader** | Full-featured backtesting |
| **VectorBT** | Vectorized backtesting (fast) |
| **Zipline** | Institutional-grade |
| **PyAlgoTrade** | Event-driven |
| **QuantLib** | Derivatives pricing |

### Data Sources
| Source | Data Type |
|--------|-----------|
| Yahoo Finance | Global stocks, free |
| VNDirect API | Vietnam stocks |
| Binance API | Crypto |
| CCXT | Multi-exchange crypto |

---

## Appendix: Backtest Checklist

### Before Running
- [ ] Strategy rules documented
- [ ] Data cleaned and adjusted
- [ ] Transaction costs included
- [ ] Survivorship bias addressed
- [ ] Train/test split defined

### After Running
- [ ] Look-ahead bias checked
- [ ] Results make logical sense
- [ ] Out-of-sample tested
- [ ] Risk metrics acceptable
- [ ] Walk-forward validated

### Before Going Live
- [ ] Paper traded successfully
- [ ] Risk management active
- [ ] Position sizing decided
- [ ] Monitoring in place
- [ ] Exit criteria defined

---

## References

1. Ernest P. Chan - "Quantitative Trading"
2. Andreas Clenow - "Following the Trend"
3. Robert Pardo - "The Evaluation and Optimization of Trading Strategies"
4. Marcos Lopez de Prado - "Advances in Financial Machine Learning"
