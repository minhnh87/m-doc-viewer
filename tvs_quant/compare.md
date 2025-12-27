# Claude Session - deeprs_quant_backtest_framework

## User

Tôi chỉ trade stocks (việt nam) thì sao? có thể ko cần cloud (tự triển khai được) thì sao?

---

## Claude

---

## Claude

*[Tool: mcp__tavily__tavily_search]*

---

## Claude

*[Tool: mcp__tavily__tavily_search]*

---

## Claude

*[Tool: mcp__tavily__tavily_search]*

---

## User

---

## User

---

## User

---

## Claude

---

## Claude

*[Tool: mcp__tavily__tavily_search]*

---

## Claude

*[Tool: mcp__tavily__tavily_search]*

---

## User

---

## User

---

## Claude

---

## Claude

*[Tool: mcp__tavily__tavily_extract]*

---

## User

---

## Claude

---

## Claude

Hoàn hảo! Với yêu cầu **stocks Việt Nam + self-hosted**, thì lựa chọn sẽ khác hoàn toàn. Đây là phân tích chi tiết:

## 🇻🇳 Khuyến Nghị Cho Stocks Việt Nam (Self-Hosted)

### **Option 1: Zipline-Reloaded + StrateQueue** ⭐ (Khuyến nghị cao nhất)

```python
# Backtest
from zipline import run_algorithm

# Production (same code!)
# stratequeue deploy --strategy my_strategy.py --engine zipline
```

**Ưu điểm:**
- ✅ **100% self-hosted**: Chạy local hoặc VPS của bạn
- ✅ **Backtest to Live**: Cùng 1 codebase (như NautilusTrader)
- ✅ **Mature**: Zipline được Quantopian phát triển, battle-tested
- ✅ **Active development**: Zipline-Reloaded được maintain tích cực 2024-2025
- ✅ **StrateQueue**: Framework mới 2025 giúp deploy production dễ dàng
- ✅ **Free & open-source**

**Nhược điểm:**
- ⚠️ **Cần custom broker adapter**: Mặc định hỗ trợ Alpaca, Interactive Brokers
  - Bạn cần tự viết adapter cho SSI/VPS/FPTS API
- ⚠️ **Setup phức tạp hơn**: Cần config data bundles

**Phù hợp cho:**
- ✅ Stocks Việt Nam
- ✅ Self-hosted
- ✅ Cần consistency backtest → production
- ⚠️ Cần thời gian viết broker integration

---

### **Option 2: QuantConnect LEAN (Local)** ⭐

```bash
# LEAN engine hoàn toàn open-source, chạy local
git clone https://github.com/QuantConnect/Lean
# Không cần cloud platform
```

**Ưu điểm:**
- ✅ **Fully self-hosted**: Engine C# + Python API
- ✅ **Production-grade**: Institutional quality
- ✅ **Comprehensive**: Backtest, optimization, live trading
- ✅ **Multi-asset**: Dù bạn chỉ trade stocks, có thể mở rộng sau
- ✅ **Good documentation**

**Nhược điểm:**
- ⚠️ **Setup phức tạp**: Cần config Lean engine (C# runtime + Python)
- ⚠️ **Cần custom broker**: Phải tự implement `IBrokerage` interface cho VN brokers
- ⚠️ **Heavy**: Resource intensive hơn Zipline

**Phù hợp cho:**
- ✅ Dự án dài hạn, muốn infrastructure mạnh
- ✅ Team có kỹ năng C#/Python
- ⚠️ Cần thời gian setup ban đầu

---

### **Option 3: Custom Solution - VectorBT + Custom Execution Layer** 🔧

```python
# Backtest/Research: VectorBT (siêu nhanh)
import vectorbt as vbt
portfolio = vbt.Portfolio.from_signals(...)

# Production: Tự viết execution engine
class VNBrokerExecutor:
    def __init__(self, broker_api):  # SSI/VPS/FPTS API
        self.broker = broker_api
    
    def execute_signals(self, signals):
        # Convert VectorBT signals → broker orders
        pass
```

**Ưu điểm:**
- ✅ **Maximum flexibility**: Tự control mọi thứ
- ✅ **Fast backtesting**: VectorBT tốc độ cao nhất
- ✅ **Lightweight**: Chỉ cần pandas, numpy
- ✅ **Custom cho VN market**: Thiết kế riêng cho SSI/VPS/FPTS

**Nhược điểm:**
- ❌ **Phải tự code toàn bộ production layer**:
  - Order management
  - Position tracking
  - Risk management
  - Error handling
  - Logging
- ❌ **Không có consistency guarantee**: Phải tự đảm bảo backtest = production
- ❌ **Time consuming**: Tốn nhiều thời gian phát triển

**Phù hợp cho:**
- ✅ Có team dev mạnh
- ✅ Muốn control hoàn toàn
- ✅ Chiến lược đơn giản (không cần complex event-driven logic)

---

### **Option 4: Backtrader + Custom Broker** (Legacy nhưng vẫn dùng được)

```python
import backtrader as bt

class VNBroker(bt.brokers.BackBroker):
    def __init__(self, ssi_api):
        # Custom broker implementation
        pass

cerebro = bt.Cerebro()
cerebro.setbroker(VNBroker(ssi_api))  # Production
```

**Ưu điểm:**
- ✅ **Simple API**: Dễ học nhất
- ✅ **Self-hosted**: 100% local
- ✅ **Nhiều examples**: Community lớn
- ✅ **Built-in broker abstraction**: Dễ tạo custom broker

**Nhược điểm:**
- ❌ **Không còn maintain**: Project đã chết (💀 since 2021)
- ❌ **Slow**: Không vectorized
- ❌ **Python 3.8 max**: Compatibility issues với Python mới

**Phù hợp cho:**
- ⚠️ Chỉ dùng nếu project đơn giản, không cần update lâu dài

---

## 🎯 Khuyến Nghị Cuối Cho Bạn

### **Best Choice: Zipline-Reloaded + StrateQueue + Custom VN Broker Adapter**

```
Architecture:
┌─────────────────────────────────────────────┐
│         Zipline-Reloaded Strategy           │
│      (Backtest & Live - same code)          │
└─────────────────┬───────────────────────────┘
                  │
          ┌───────▼────────┐
          │  StrateQueue   │ (Deployment framework)
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │ Custom Adapter │ (You write this)
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │  SSI/VPS/FPTS  │ (Broker API)
          │      API       │
          └────────────────┘
```

**Implementation Plan:**

```python
# 1. Viết strategy với Zipline-Reloaded (works cho cả backtest & live)
from zipline.api import order_target_percent, symbol

def initialize(context):
    context.asset = symbol('VNM')  # Vinamilk

def handle_data(context, data):
    # Logic giống nhau cho backtest và production
    if data.can_trade(context.asset):
        order_target_percent(context.asset, 0.5)

# 2. Tạo custom broker adapter cho VN stocks
# File: vn_broker_adapter.py
class SSIBrokerAdapter:
    """Adapter cho SSI iBoard API"""
    def __init__(self, api_key, secret):
        self.client = SSIClient(api_key, secret)
    
    def place_order(self, symbol, quantity, side):
        return self.client.order(
            stock_code=symbol,
            quantity=quantity,
            side=side
        )
    
    def get_positions(self):
        return self.client.get_portfolio()

# 3. Deploy với StrateQueue
# stratequeue deploy --strategy my_strategy.py \
#                    --broker custom_vn \
#                    --symbol VNM
```

**Tại sao chọn option này?**
1. ✅ **Self-hosted 100%**: Chạy trên máy bạn hoặc VPS VN
2. ✅ **Same codebase**: Backtest = Production (critical!)
3. ✅ **Modern**: Được maintain tích cực 2025
4. ✅ **Proven**: Zipline được dùng bởi hàng nghìn traders
5. ✅ **Extensible**: Dễ tích hợp với bất kỳ broker VN nào
6. ⚠️ **Effort**: Cần viết broker adapter (1-2 tuần), nhưng **chỉ 1 lần**

---

## 📦 Các Broker API Việt Nam Bạn Có Thể Dùng

### **1. SSI (iBoard API)**
- ✅ REST API + WebSocket
- ✅ Có documentation
- ✅ Support tốt
- [https://www.ssi.com.vn/iboard-api](https://www.ssi.com.vn/)

### **2. VPS (SmartOne API)**
- ✅ REST API
- ⚠️ Documentation hạn chế hơn
- [https://www.vps.com.vn](https://www.vps.com.vn/)

### **3. FPTS (eztrade API)**
- ✅ REST API
- ⚠️ Cần liên hệ để access
- [https://www.fpts.com.vn](https://www.fpts.com.vn/)

---

## 🚀 Roadmap Thực Tế

**Phase 1: Backtesting (1-2 tuần)**
```bash
pip install zipline-reloaded
# Develop & backtest strategies locally
```

**Phase 2: Broker Integration (2-4 tuần)**
```python
# Tạo adapter cho SSI/VPS/FPTS API
# Test trên paper trading
```

**Phase 3: Production (1 tuần)**
```bash
pip install "stratequeue[zipline]"
stratequeue deploy --strategy my_strategy.py
```

**Total: 1-2 tháng** để có production system hoàn chỉnh.

---

**Tổng kết:**
- Stocks VN + Self-hosted → **Zipline-Reloaded + Custom Broker** là best choice
- Alternative: **LEAN local** nếu bạn muốn enterprise-grade (phức tạp hơn)
- Avoid: Cloud platforms (QuantConnect cloud, TradeStation) - không phù hợp yêu cầu self-hosted

Bạn muốn tôi giúp gì thêm? Research về SSI API hay setup Zipline-Reloaded?

**Sources:**
- [From Backtest to Live: Zipline-Reloaded 2025](https://medium.com/@samuel.tinnerholm/from-backtest-to-live-going-live-with-zipline-reloaded-in-2025-step-by-step-guide-40e55ca264f1)
- [Popular Backtesting Libraries Comparison](https://safjan.com/popular-backtesting-libraries/)
- [LEAN vs Zipline Discussion](https://exchange.ml4trading.io/t/lean-quant-connect-vs-zipline-reloaded/200)

---

