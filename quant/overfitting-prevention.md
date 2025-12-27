# Các Biện Pháp Tránh Overfitting Trong Quant Trading

## 1. Chia Dữ Liệu Đúng Cách (Data Splitting)

```
┌─────────────────┬───────────────┬─────────────┐
│  Training Set   │ Validation Set│  Test Set   │
│    50-60%       │    20-25%     │   15-20%    │
│  (Tối ưu hóa)   │ (Chọn model)  │(Đánh giá cuối)
└─────────────────┴───────────────┴─────────────┘
```

**Quy tắc vàng:**
- **Training**: Dùng để optimize parameters
- **Validation**: Dùng để chọn model tốt nhất
- **Test**: **KHÔNG BAO GIỜ** nhìn cho đến khi quyết định cuối cùng

---

## 2. Walk-Forward Analysis (Quan trọng nhất)

Thay vì backtest một lần trên toàn bộ dữ liệu, chia thành nhiều giai đoạn:

```
Giai đoạn 1: Train [2015-2018] → Test [2019]
Giai đoạn 2: Train [2016-2019] → Test [2020]
Giai đoạn 3: Train [2017-2020] → Test [2021]
Giai đoạn 4: Train [2018-2021] → Test [2022]
...
```

**Walk-Forward Efficiency**:
- **> 60%**: Strategy robust
- **40-60%**: Cần xem xét thêm
- **< 40%**: Dấu hiệu overfitting nghiêm trọng

---

## 3. Out-of-Sample Testing

| Metric | In-Sample | Out-of-Sample | Đánh giá |
|--------|-----------|---------------|----------|
| Sharpe | 2.5 | 2.1 | ✅ Tốt |
| Sharpe | 2.5 | 0.8 | ❌ Overfitted |
| Sharpe | 2.5 | 0.3 | ❌ Nghiêm trọng |

**Nếu performance giảm >50% ở OOS → Overfitting!**

---

## 4. Giữ Strategy Đơn Giản (KISS Principle)

### Giới hạn số lượng parameters:
- **2-4 parameters**: Lý tưởng
- **5-7 parameters**: Chấp nhận được
- **> 10 parameters**: Nguy hiểm cao

### Ví dụ:
```python
# ❌ Quá nhiều parameters (dễ overfit)
strategy(ma_fast=12, ma_slow=26, rsi_period=14,
         rsi_upper=70, rsi_lower=30, atr_mult=2.5,
         volume_thresh=1.5, momentum_period=20...)

# ✅ Đơn giản (robust hơn)
strategy(ma_fast=10, ma_slow=50, stop_loss_pct=2)
```

---

## 5. Monte Carlo Simulation

Chạy 1000+ lần với:
- **Thay đổi thứ tự trades** (shuffle)
- **Thêm nhiễu vào data**
- **Thay đổi starting capital**

```
Kết quả phân phối:
- Median Sharpe: 1.2
- 5th percentile: 0.4
- 95th percentile: 2.0

→ Nếu 5th percentile vẫn dương = Strategy robust
```

---

## 6. Regularization Techniques

### L1/L2 Regularization:
```python
# Thêm penalty term vào objective function
Loss = Performance_Loss + λ * ||weights||²

# λ càng lớn → Model càng đơn giản → Ít overfit hơn
```

### Dropout (cho ML models):
- Randomly "tắt" một số neurons khi training
- Buộc model học features robust hơn

---

## 7. Parameter Sensitivity Analysis

Test xem strategy có **nhạy cảm** với parameter changes không:

```
MA_fast = 10 → Sharpe 1.5
MA_fast = 11 → Sharpe 1.4
MA_fast = 12 → Sharpe 1.3
MA_fast = 9  → Sharpe 1.6

→ ✅ Stable (thay đổi nhỏ)

MA_fast = 10 → Sharpe 1.5
MA_fast = 11 → Sharpe 0.2
MA_fast = 12 → Sharpe -0.5

→ ❌ Overfitted (quá nhạy)
```

---

## 8. Multi-Market/Timeframe Testing

Test strategy trên:
- **Nhiều markets khác nhau** (stocks, forex, crypto)
- **Nhiều timeframes** (1h, 4h, daily)
- **Nhiều giai đoạn thị trường** (bull, bear, sideways)

**Nếu chỉ hoạt động trên 1 market/timeframe → Likely overfitted**

---

## 9. Stress Testing

Test trong các điều kiện cực đoan:
- **2008 Financial Crisis**
- **COVID-19 crash (March 2020)**
- **Flash crashes**
- **High volatility periods**

---

## 10. Deflated Sharpe Ratio

Điều chỉnh Sharpe ratio dựa trên **số lượng strategies đã test**:

```
Deflated SR = SR - bias_from_multiple_testing

Ví dụ:
- Test 100 strategies → Chọn cái tốt nhất
- Expected false discovery rate rất cao
- Cần điều chỉnh significance level
```

---

## Checklist Tránh Overfitting

| # | Kiểm tra | ✓/✗ |
|---|----------|-----|
| 1 | Có Out-of-Sample test? | ☐ |
| 2 | Walk-forward efficiency > 40%? | ☐ |
| 3 | Số parameters ≤ 5? | ☐ |
| 4 | Performance stable khi đổi params nhỏ? | ☐ |
| 5 | Hoạt động trên nhiều markets? | ☐ |
| 6 | Vượt qua Monte Carlo simulation? | ☐ |
| 7 | Có tính phí giao dịch + slippage? | ☐ |
| 8 | Logic có ý nghĩa kinh tế? | ☐ |

---

## Quy Tắc Cuối Cùng

> **"If it looks too good to be true, it probably is."**

- Sharpe > 3.0 trên backtest → **Rất đáng ngờ**
- Drawdown < 5% trong nhiều năm → **Kiểm tra lại**
- Win rate > 80% → **Có thể đang cheat**

**Strategy tốt thường có kết quả "vừa phải" nhưng CONSISTENT trên nhiều điều kiện khác nhau.**

---

## Red Flags của Overfitting

| Red Flag | Giải thích |
|----------|------------|
| Sharpe > 3 | Quá đẹp để là thật |
| Quá nhiều parameters | Dễ fit noise |
| Chỉ work trên 1 market | Không generalizable |
| Performance drop >50% OOS | Classic overfitting |
| Win rate > 80% | Likely data snooping |
| Tiny drawdowns | Unrealistic |

---

## Best Practices Summary

1. **Split data properly** - Train/Validation/Test
2. **Walk-forward analysis** - Rolling windows
3. **Keep it simple** - Fewer parameters
4. **Test robustness** - Parameter sensitivity
5. **Multiple markets** - Cross-validation
6. **Realistic costs** - Slippage, commission
7. **Monte Carlo** - Stress test results
8. **Economic logic** - Strategy makes sense

---

*Report generated: 2025-12-07*
