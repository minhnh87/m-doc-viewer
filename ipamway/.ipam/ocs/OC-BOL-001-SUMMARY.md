# OC-BOL-001: Bộ Lệnh Điều Kiện MVP - Executive Summary

**OC Code:** OC-BOL-001
**OC Owner:** A Long (BIS)
**Status:** IDENTIFY Phase Complete (1/5)
**Created:** 2025-12-15
**Target Go-Live:** Q1 2026 (2 tháng)

---

## 📌 TL;DR (One-liner)

Ra mắt MVP gồm 2 lệnh điều kiện cốt lõi (Trailing Stop + OCO) trong 2 tháng để đáp ứng nhu cầu quản trị rủi ro của khách hàng giao dịch chủ động và close gap cạnh tranh với thị trường.

---

## 🎯 Vấn đề (Problem Statement)

**Thực trạng:**
- VNDIRECT chỉ có **1 loại lệnh điều kiện** (Stop Limit)
- Đối thủ có **6-8 loại lệnh** (TCBS: 6, MAS: 8, SSI: 6)
- Thiếu 2 lệnh cốt lõi mà 100% đối thủ đều có: **Trailing Stop** và **OCO**

**Impact:**
- **Adoption thấp:** 5.6% khách hàng sử dụng lệnh điều kiện
- **Churn risk:** Khách hàng chuyển sang dùng app đối thủ vì thiếu tính năng
- **Perception:** VND bị đánh giá "lỗi thời" trong mắt active traders

**NHƯNG:**
- **Activation rate 54%** → Khi KH dùng được, lệnh có giá trị cao
- → Vấn đề nằm ở: (1) Thiếu features, (2) UX phức tạp, (3) Thiếu education

---

## 👥 Khách hàng Mục tiêu

**4 Segments giao dịch chủ động:**

| Segment | Đặc điểm | Pain Points | Giải pháp |
|---------|----------|-------------|-----------|
| **Day Traders** | 50 lệnh/tháng, vòng quay 15x | Không kịp cắt lỗ khi biến động mạnh | Trailing Stop |
| **Active Traders** | 15 lệnh/tháng, vòng quay 6x | Không thể canh bảng khi bận làm | OCO |
| **Swing Traders** | 6 lệnh/tháng, check app 1x/ngày | Thiếu kỷ luật, không rõ điểm thoát | Trailing Stop + OCO |
| **Long-term Investors** | Ít giao dịch | Không biết nên bán khi nào | OCO |

**Nhu cầu chung:**
- Kiểm soát rủi ro (cắt lỗ/chốt lời kỷ luật)
- Giảm phụ thuộc theo dõi liên tục
- Tự động hóa kịch bản để giảm sai thao tác

---

## 💡 Giải pháp (Solution)

### MVP Scope (2 tháng)

**2 Lệnh điều kiện cốt lõi:**
1. **Trailing Stop** (cơ sở)
   - Điểm quan tâm: **3.52/5**
   - Use case: Bảo vệ lợi nhuận trong xu hướng tăng
   - Stop loss tự động leo theo giá

2. **OCO (One-Cancels-Other)** (cơ sở)
   - Điểm quan tâm: **3.2/5**
   - Use case: Đặt mục tiêu rõ ràng (TP + SL), 1 thực hiện thì hủy cái kia

**UX/UI Improvements:**
- ✅ Dual-mode order ticket (dọc + ngang)
- ✅ Trực quan hóa trên biểu đồ
- ✅ In-context help (định nghĩa + ví dụ + cảnh báo rủi ro)
- ✅ Full funnel tracking

**Out of Scope (Phase 2):**
- ❌ TWAP, Iceberg, Signal-based orders
- ❌ Bull & Bear combo
- ❌ API integration

---

## 📊 Key Metrics

**Baseline (Tháng 10/2024):**
- Adoption: 5.6% tổng lệnh
- Lệnh điều kiện/KH/ngày: 0.28
- Activation rate: 54%

**Target (Post-MVP):**
- Adoption: TBD (sẽ define trong PLAN phase)
- Activation rate: Maintain ≥54%
- Feature parity: 3 lệnh vs đối thủ 6-8 lệnh (close gap một phần)

---

## 🏗️ Architecture Overview

```
Frontend (DSTOCK/DBoard)
    ↓
Conditional Order Engine (NEW)
    ├─ Order Management Service
    ├─ Price Monitoring Service (real-time)
    ├─ Activation Service (trailing logic, OCO cancellation)
    └─ Tracking Service (funnel analytics)
    ↓
Core Trading System + Market Data Feed
```

---

## 👥 Stakeholders & Team

**Decision Makers:**
- A Long (BIS) - OC Owner
- A Hoan, A Nam (PM)
- C Liên Dương (Legal) - Compliance approval critical

**Delivery Team (6-7 người):**
- A Minh (VND BTU)
- A Thuận (SA)
- A Duy (Techlead)
- C Tuyết (BE)
- A Giang (FE Lead)
- Bách (BA)
- C Quỳnh (QA)

**Support:**
- C Vy (CXM) - UX design

---

## ✅ Compliance & Ethics

**Critical Requirements:**
- ✅ Risk disclosure mandatory (checkbox before first use)
- ✅ Legal review by C Liên Dương required
- ✅ UBCKNN regulations compliance:
  - Price limit: Within ±7% reference price
  - Trading halt handling
  - Audit trail (5-year retention)
- ✅ In-context warnings at order placement

**No-Go:**
- ❌ Market manipulation patterns
- ❌ Priority queue for VIP (fairness)
- ❌ Hidden behavior without notification

---

## 🎯 Why This Matters (Business Case)

**Strategic:**
1. **Close competitive gap** - Trailing Stop + OCO là market standard
2. **Prevent churn** - KH đang compare với đối thủ
3. **Brand perception** - Không còn bị gọi "lỗi thời"

**Tactical:**
1. **Validate demand** - Demand scores 3.52 và 3.2 → High interest
2. **Prove value** - Activation 54% → Product-market fit exists
3. **Foundation for scale** - MVP architecture có thể extend phase 2

**Customer:**
1. **Empower traders** - Tự chủ quản trị rủi ro
2. **Reduce stress** - "Set and forget" không cần canh
3. **Improve discipline** - Tự động thực hiện theo kế hoạch

---

## 🚀 Next Steps

**IDENTIFY Phase: ✅ Complete**

**Coming Next:**
1. **PLAN Phase (5P - OTOOB)**
   - Purpose: SMART objectives, OTOOB breakdown
   - Pathway: Roadmap, milestones, dependencies
   - Perspective: Communication plan, change management
   - Priorities: P1 vs P2, resource allocation, quick wins
   - Performance: KPI dashboard, baseline/target

2. **ACCOUNTABILITY Phase (5A - OMVP)**
   - Define OMVP
   - RACI matrix
   - Sprint plan
   - Progress tracking
   - Feedback loops

3. **MANAGE Phase (5M)**
   - Value stream mapping
   - KPI tracking
   - Monitoring & alerts
   - Review cadence
   - Sustainability plan

---

## 📈 Success Criteria (High-level)

**MVP Launch (2 months):**
- [ ] 2 conditional orders live (Trailing Stop + OCO)
- [ ] UX improvements deployed
- [ ] Legal/compliance approval obtained
- [ ] Funnel tracking operational

**Post-Launch (3-6 months):**
- [ ] Adoption rate improvement (TBD target)
- [ ] Activation rate maintained ≥54%
- [ ] Customer feedback positive
- [ ] Foundation for Phase 2 validated

---

## 📂 Document Structure

**Full OC Document:** `.ipam/ocs/OC-BOL-001-IDENTIFY.md` (~8,500 words)

**Sections Completed:**
- ✅ 1.1 INTENTION - Vision, objectives, MVP scope
- ✅ 1.2 INTERCONNECT - Stakeholders, systems, impact ripple
- ✅ 1.3 INSIGHT - Customer segments, data analysis, root cause
- ✅ 1.4 INNOVATION - Solution options, architecture
- ✅ 1.5 INTEGRITY - Values, ethics, compliance

**Pending:**
- ⏳ 2.0 PLAN Phase
- ⏳ 3.0 ACCOUNTABILITY Phase
- ⏳ 4.0 MANAGE Phase

---

## 🔑 Key Takeaways

1. **Proven demand:** Điểm quan tâm 3.52/5 và 3.2/5, activation 54%
2. **Clear gap:** VND 1 lệnh vs thị trường 6-8 lệnh
3. **Smart scope:** MVP với 2 lệnh cốt lõi, 2 tháng delivery
4. **Customer-first:** Giải quyết pain points cụ thể của 4 segments
5. **Compliance-ready:** Legal review và risk disclosure baked in

**Bottom line:** High-value, low-risk MVP to close critical competitive gap and serve active trader needs.

---

**Last Updated:** 2025-12-15
**Version:** 1.0 (IDENTIFY Phase)
**Next Review:** PLAN Phase kickoff
