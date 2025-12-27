# Báo Cáo So Sánh Framework Backtesting
## Backtrader vs Zipline-Reloaded

**Ngày:** 27/12/2024
**Mục đích:** Đánh giá và lựa chọn framework cho hệ thống backtest + production trading stocks Việt Nam

---

## 1. Tóm Tắt (Executive Summary)

| Tiêu chí | Backtrader | Zipline-Reloaded | Winner |
|----------|------------|------------------|--------|
| Trạng thái phát triển | ❌ Ngừng (2021) | ✅ Active (2024-2025) | Zipline |
| Production-ready | ⚠️ Hạn chế | ✅ Có | Zipline |
| Backtest → Live | ⚠️ Phải viết lại code | ✅ Cùng codebase | Zipline |
| Tài liệu & Community | ✅ Nhiều (legacy) | ✅ Đang phát triển | Hòa |
| Self-hosted | ✅ Có | ✅ Có | Hòa |
| Tích hợp broker VN | ⚠️ Custom | ⚠️ Custom | Hòa |

**Khuyến nghị: Zipline-Reloaded**

---

## 2. Chi Tiết So Sánh

### 2.1 Trạng Thái Phát Triển

| | Backtrader | Zipline-Reloaded |
|--|------------|------------------|
| Commit cuối | 2021 | 2024-2025 |
| Maintainer | Không còn active | Stefan Jansen + community |
| Python support | 3.6-3.8 | 3.10+ |
| Bug fixes | Không | Có |
| Security updates | Không | Có |

**Rủi ro Backtrader:** Không có security patches, không compatible Python mới, bugs không được fix.

### 2.2 Kiến Trúc & Production

**Backtrader:**
```
Backtest Code ──→ [VIẾT LẠI] ──→ Production Code
     ↓                              ↓
 Khác logic              Khác implementation
```
- Cần viết lại order management, position tracking cho live trading
- Không đảm bảo kết quả backtest = production

**Zipline-Reloaded:**
```
Strategy Code ──→ Backtest
     ↓
Strategy Code ──→ Production (via StrateQueue)
     ↓
CÙNG 1 CODEBASE
```
- Backtest và production dùng chung code
- Đảm bảo consistency

### 2.3 Hiệu Năng

| Metric | Backtrader | Zipline-Reloaded |
|--------|------------|------------------|
| Tốc độ backtest | Chậm (loop-based) | Trung bình (event-driven) |
| Memory usage | Cao | Tối ưu hơn |
| Large datasets | ⚠️ Khó khăn | ✅ Xử lý tốt |

### 2.4 Tích Hợp Broker Việt Nam (SSI/VPS/FPTS)

Cả 2 framework đều cần custom adapter cho broker VN:

| Công việc | Backtrader | Zipline-Reloaded |
|-----------|------------|------------------|
| Custom broker adapter | ~2-3 tuần | ~2 tuần |
| Có framework hỗ trợ | Không | StrateQueue |
| Độ phức tạp | Cao (legacy code) | Trung bình |

---

## 3. Phân Tích Rủi Ro

### Backtrader
| Rủi ro | Mức độ | Mô tả |
|--------|--------|-------|
| Project chết | **Cao** | Không có updates từ 2021 |
| Incompatible Python | **Cao** | Python 3.9+ có issues |
| Security | **Trung bình** | Không có patches |
| Technical debt | **Cao** | Legacy code khó maintain |

### Zipline-Reloaded
| Rủi ro | Mức độ | Mô tả |
|--------|--------|-------|
| Newer framework | **Thấp** | Vẫn active development |
| Learning curve | **Thấp** | Documentation đầy đủ |
| Community size | **Thấp** | Nhỏ hơn Backtrader legacy |

---

## 4. Chi Phí Triển Khai (Ước Tính)

### Backtrader
| Phase | Thời gian | Ghi chú |
|-------|-----------|---------|
| Setup & learning | 1 tuần | Docs tốt |
| Develop strategies | 2-3 tuần | |
| Custom broker adapter | 2-3 tuần | |
| Production wrapper | **3-4 tuần** | Phải viết từ đầu |
| Testing & debugging | 2 tuần | Legacy code issues |
| **Tổng** | **10-13 tuần** | |

### Zipline-Reloaded
| Phase | Thời gian | Ghi chú |
|-------|-----------|---------|
| Setup & learning | 1-2 tuần | |
| Develop strategies | 2-3 tuần | |
| Custom broker adapter | 2 tuần | StrateQueue hỗ trợ |
| Production deployment | **1 tuần** | StrateQueue deploy |
| Testing & debugging | 1-2 tuần | Modern codebase |
| **Tổng** | **7-10 tuần** | |

**Tiết kiệm: 3-4 tuần với Zipline-Reloaded**

---

## 5. Long-term Maintainability

| Yếu tố | Backtrader | Zipline-Reloaded |
|--------|------------|------------------|
| Future Python versions | ❌ Rủi ro cao | ✅ Được support |
| Bug fixes | ❌ Tự fix | ✅ Community fix |
| New features | ❌ Không có | ✅ Ongoing |
| Hiring/Onboarding | ⚠️ Outdated skills | ✅ Modern stack |
| Technical debt | 📈 Tăng theo thời gian | 📉 Được quản lý |

---

## 6. Khuyến Nghị

### Lựa chọn: **Zipline-Reloaded**

**Lý do chính:**

1. **Active development** - Được maintain, có bug fixes và security updates
2. **Production consistency** - Cùng code cho backtest và live trading
3. **Modern Python** - Hỗ trợ Python 3.10+, compatible với ecosystem hiện đại
4. **Thời gian triển khai ngắn hơn** - Tiết kiệm 3-4 tuần development
5. **Long-term viability** - Không lo project chết, dễ maintain

**Trade-offs chấp nhận được:**
- Community nhỏ hơn Backtrader (nhưng Backtrader không còn active)
- Cần học API mới (nhưng documentation tốt)

---

## 7. Kế Hoạch Triển Khai (Nếu Chọn Zipline-Reloaded)

```
Phase 1: Setup (Tuần 1-2)
├── Cài đặt Zipline-Reloaded
├── Setup development environment
└── Prototype đầu tiên

Phase 2: Development (Tuần 3-5)
├── Phát triển strategies
├── Backtest với data VN stocks
└── Optimize performance

Phase 3: Broker Integration (Tuần 6-7)
├── Develop SSI/VPS adapter
├── Paper trading test
└── Error handling

Phase 4: Production (Tuần 8-10)
├── Deploy với StrateQueue
├── Monitoring setup
├── Go-live với capital nhỏ
└── Scale up
```

---

## 8. Kết Luận

Với yêu cầu:
- ✅ Stocks Việt Nam
- ✅ Self-hosted
- ✅ Backtest + Production trading

**Zipline-Reloaded là lựa chọn phù hợp hơn** vì đảm bảo long-term maintainability, production consistency, và tiết kiệm thời gian phát triển.

Backtrader không được khuyến nghị do project đã ngừng phát triển từ 2021, tạo rủi ro kỹ thuật cao trong dài hạn.

---

*Báo cáo được tạo ngày 27/12/2024*
