# OC Document: Bộ Lệnh MVP

---

## Executive Summary

VNDIRECT hiện chỉ hỗ trợ 1 loại lệnh điều kiện (Stop Limit) trong khi các đối thủ đã cung cấp 6-8 loại lệnh, khiến VND bị đánh giá lỗi thời và tụt lại trong cuộc đua tính năng. OC này đề xuất ra mắt **MVP gồm 2 lệnh điều kiện cốt lõi** (Trailing Stop + OCO) trong 2 tháng để:

1. **Khắc phục gap cạnh tranh** - Đáp ứng tiêu chuẩn thị trường đã được chuẩn hóa
2. **Tăng adoption** - Cải thiện UX với dual-mode ticket, chart integration, in-context help
3. **Giữ chân khách hàng** - Phục vụ tệp Day/Active/Swing Traders với công cụ quản trị rủi ro tự động

Baseline: Adoption 5.6%, activation rate 54%. Target: Đủ tính năng để cạnh tranh, validate adoption trước khi mở rộng thêm lệnh.

---

## 🔍 IDENTIFY PHASE

### 1.1 💡 INTENTION - Tại sao phải làm?

#### Vision Statement
"Trao quyền cho nhà đầu tư trong quản trị rủi ro và kỷ luật giao dịch thông qua tự động hóa bộ lệnh điều kiện, giúp khách hàng đặt sẵn kịch bản, giảm phụ thuộc vào việc theo dõi liên tục, và giảm sai thao tác do áp lực thời gian."

#### Business Objectives

**1. Khắc phục rão cản cạnh tranh**
- **Vấn đề:** VND đang tụt lại so với thị trường về tính năng các lệnh điều kiện
  - VND: 1 lệnh (Stop Limit only)
  - TCBS: 6 lệnh
  - Mirae Asset: 8 lệnh
  - SSI: 6 lệnh
  - VPS, MBS, MAS: Đều có Trailing Stop + OCO
- **Impact:** Bị đánh giá lỗi thời khi nhà đầu tư so sánh với các công ty chứng khoán khác
- **Risk:** Mất khách hàng sang đối thủ có tính năng tốt hơn

**2. Tăng adoption lệnh điều kiện và giữ chân tệp khách hàng giao dịch chủ động**
- **Current adoption:** Chỉ 5.6% tổng lệnh (tháng 10/2024)
- **Opportunity:** Activation rate 54% cho thấy value khi KH dùng
- **Target segment:** Day Traders, Active Traders, Swing Traders

**3. Khoanh lại phạm vi - MVP approach**
- Làm lại đủ các luồng lệnh cơ bản
- MVP gồm 2 lệnh điều kiện được market demand nhất
- Validate adoption trước khi scale

#### Success Definition (MVP Scope)

**In Scope:**
- ✅ 2 loại lệnh điều kiện cốt lõi:
  1. **Trailing Stop** (cơ sở) - Điểm quan tâm: 3.52/5
  2. **OCO** (One-Cancels-Other, cơ sở) - Điểm quan tâm: 3.2/5
- ✅ Dual-mode order ticket (dọc + ngang)
- ✅ Trực quan hóa trên biểu đồ
- ✅ In-context help (định nghĩa + ví dụ + cảnh báo rủi ro)
- ✅ Full funnel tracking

**Out of Scope (for later):**
- ❌ Advanced orders: TWAP, Iceberg, AI-based orders
- ❌ Technical indicator-based orders
- ❌ Periodic orders (đầu tư định kỳ)
- ❌ Bull & Bear combo orders
- ❌ API integration (phase 2)

---

### 1.2 🔗 INTERCONNECT - Stakeholders & Systems

#### Key Stakeholders

| Nhóm | Tên | Vai trò | Responsibility | Impact Level |
|------|-----|---------|----------------|--------------|
| **BIS** | A Long | Product Owner | Strategy, roadmap, approval | Critical |
| **Product Management** | A Hoan, A Nam | Product Manager | Requirements, feature prioritization | High |
| **CXM** | C Vy | CX Designer | UX/UI design, user research | High |
| **Pháp chế** | C Liên Dương | Legal/Compliance | Regulatory review, risk disclosure | Critical |
| **VND BTU** | A Minh | DPO | Product Owner | High |
| **SA** | A Thuận | Solution Architect | Architecture design, tech decisions | High |
| **Techlead** | A Duy | Tech Lead | Technical delivery, code quality | High |
| **Backend** | C Tuyết | BE Developer | Order engine, business logic | High |
| **Frontend Techlead** | A Giang | FE Lead | App UI, chart integration | High |
| **BA** | Bách | Business Analyst | Requirements analysis, UAT | Medium |
| **QA** | C Quỳnh | QA Engineer | Test strategy, quality assurance | High |
| **Khách hàng** | Day/Active/Swing Traders | End Users | Product usage, feedback | Critical |



#### Impact Ripple

**Direct Impact:**
1. **Khách hàng giao dịch chủ động** (Day/Active/Swing Traders)
   - ✅ Có công cụ quản trị rủi ro tự động
   - ✅ Giảm stress theo dõi liên tục
   - ✅ Tăng kỷ luật giao dịch (cắt lỗ/chốt lời đúng lúc)

2. **Product Team**
   - ✅ Đáp ứng được nhu cầu thị trường cấp bách
   - ✅ Thu được feedback để iterate

**Indirect Impact:**
1. **Brand Perception**
   - VND không còn bị đánh giá "lỗi thời"
   - Cải thiện brand equity trong mắt active traders

2. **Competitive Positioning**
   - Bắt kịp baseline của thị trường (từ 1 lệnh → 3 lệnh)
   - Foundation để tiếp tục mở rộng (phase 2: thêm 4-5 lệnh nữa)

3. **Revenue Potential**
   - Giữ chân khách hàng có trading frequency cao
   - Tăng trading volume (khi KH tự tin hơn với risk management)

4. **Môi giới Team**
   - Có selling point khi tiếp cận KH mới
   - Giảm churn rate của active traders

---

### 1.3 📊 INSIGHT - Thực trạng và Nhu cầu Khách hàng

#### Phân khúc Khách hàng Mục tiêu

**Nhu cầu chung của khách hàng giao dịch VNDTRADE:**
- Kiểm soát rủi ro (cắt lỗ/chốt lời kỷ luật)
- Giảm phụ thuộc vào việc theo dõi liên tục trong giờ giao dịch
- Tự động hóa kịch bản thắng/thua để giảm thao tác muộn và sai

**Segment hành vi giao dịch:**

**1. Day Traders (Nhà đầu tư ngắn hạn)**
- **Chân dung:**
  - Tần suất cao, quyết định nhanh trong phiên
  - ~50 lệnh/tháng, vòng quay 15 lần/tháng
- **Pain Points:**
  - Không kịp cắt lỗ khi biến động mạnh
  - Phải theo dõi liên tục
- **Giải pháp cần thiết:**
  - Tự động hóa bảo vệ lợi nhuận và cắt lỗ tức thời

**2. Active Traders (Nhà đầu tư tích cực)**
- **Chân dung:**
  - Giao dịch thường xuyên nhưng bị gián đoạn bởi công việc
  - ~15 lệnh/tháng, vòng quay 6 lần/tháng
- **Pain Points:**
  - Không thể canh bảng khi bận làm
  - Lo lắng khi không xem được thị trường
  - Bỏ lỡ điểm chốt lời
- **Giải pháp cần thiết:**
  - Đặt trước kịch bản để không cần canh

**3. Swing Traders (Nhà đầu tư theo xu hướng)**
- **Chân dung:**
  - Tần suất vừa, theo xu hướng vài ngày/tuần
  - ~6 lệnh/tháng, check app 1 lần/ngày
- **Pain Points:**
  - Giữ lệnh lỗ quá lâu
  - Không rõ điểm chốt lời
  - Bỏ lỡ breakout
- **Giải pháp cần thiết:**
  - Bảo vệ lợi nhuận trong xu hướng tăng

**4. Long-term Investors (Nhà đầu tư dài hạn)**
- **Chân dung:**
  - Ít giao dịch, ít khi sử dụng app
- **Pain Points:**
  - Quên mua đều đặn hàng tháng
  - Không biết nên bán khi nào
  - Danh mục mất cân đối theo thời gian
- **Giải pháp cần thiết:**
  - Đặt mục tiêu rõ ràng khi vào lệnh

---

#### Thực trạng Sử dụng Lệnh Điều kiện

**Dữ liệu từ nền tảng (Tháng 10/2024):**

**Tỷ lệ sử dụng:**
- Adoption lệnh điều kiện: **5.6%** tổng lệnh trong tháng
- Trung bình: **0.28 lệnh điều kiện/khách hàng/ngày**
- Activation rate: **54%** lệnh điều kiện kích hoạt thành lệnh thường

**Phân tích:**
- Adoption thấp (5.6%) cho thấy rào cản lớn trong việc sử dụng
- Activation rate 54% cho thấy khi khách hàng hiểu và sử dụng được, lệnh có giá trị thực tế
- Gap giữa adoption và activation rate gợi ý vấn đề nằm ở onboarding và UX

**Nhu cầu từ phía MG/KH:**

Đội ngũ mong muốn có các bộ lệnh cơ sở:
- **Lệnh Trailing Stop**: Điểm quan tâm **3.52/5**
- **Lệnh OCO**: Điểm quan tâm **3.2/5**

Đội ngũ quan tâm đến các lệnh có tính chất quản trị rủi ro và tự động hóa.

**Rào cản UX/UI hiện tại:**
- Không có trực quan hóa trên biểu đồ (vừa đặt lệnh vừa xem biểu đồ)
- Không có hướng dẫn sử dụng lệnh tại điểm thao tác
- Thiếu sự tùy chỉnh: không cho phép KH tùy chỉnh các tham số của lệnh
- Thiếu tích hợp API đặt lệnh cho automation

---

#### So sánh với Thị trường

**Thực trạng VNDIRECT:**
- Chỉ hỗ trợ **1 loại lệnh: Stop Limit**

**Các công ty chứng khoán khác:**

Thị trường có xu hướng mở rộng "hệ sinh thái lệnh" theo 2 lớp:
- **Lớp 1:** Lệnh điều kiện (Risk Management) - Stop Loss, Trailing Stop, OCO
- **Lớp 2:** Lệnh chiến lược (Automation) - TWAP, Iceberg, Signal-based

**Các đối thủ trên thị trường đều có nhiều loại lệnh điều kiện:**
- TCBS: 6 lệnh
- Mirae Asset: 8 lệnh
- SSI: 6 lệnh

**2 lệnh cốt lõi đã trở thành tiêu chuẩn:**
- Hầu hết các công ty CK lớn (VPS, TCBS, SSI, MBS, MAS) đều cung cấp:
  - **Trailing Stop**
  - **OCO (One-Cancels-Other)**
- VND đang thiếu cả 2 lệnh này

**Xu hướng dịch chuyển:**
- TCBS và MAS đã cung cấp lệnh dựa trên tín hiệu kỹ thuật, lệnh TWAP, Iceberg
- DNSE cũng cung cấp lệnh đặt theo AI
- Thị trường đang hướng tới việc tự động hóa các chiến lược giao dịch tinh vi

**Phân khúc KH rõ rệt:**
- Lệnh Tranh Mua/Bán → Day Trader
- Lệnh định kỳ → Long-term investor
- Trailing Stop/OCO → Active/Swing Traders

**Tăng trải nghiệm người dùng:**
- SSI và TCBS có lệnh Bull & Bear (Take Profit / Stop Loss) tự động hóa hoàn toàn vòng đời giao dịch
- Xu hướng: Simplified UX cho complex logic

---

#### Phân tích Dữ liệu

**Số liệu Baseline:**

| Metric | Giá trị hiện tại | Nhận xét |
|--------|------------------|----------|
| **Adoption rate** | 5.6% tổng lệnh | Thấp - phần lớn KH không sử dụng |
| **Lệnh điều kiện/KH/ngày** | 0.28 | Thấp - chưa trở thành thói quen |
| **Activation rate** | 54% | Tốt - khi dùng thì có giá trị |

**Demand từ MG/KH:**

| Tính năng | Điểm quan tâm (out of 5) |
|-----------|--------------------------|
| **Trailing Stop** | 3.52 / 5 |
| **OCO** | 3.2 / 5 |

**Key Insight:**
- Activation rate 54% cho thấy value khi khách hàng hiểu và sử dụng được
- Adoption 5.6% cho thấy rào cản lớn: thiếu features, UX phức tạp, thiếu education
- Điểm quan tâm cao (3.52 và 3.2) cho Trailing Stop và OCO xác nhận nhu cầu thực tế

---

#### Nhu cầu Chưa Được Đáp ứng

**Từ phân tích customer segments và pain points:**

**1. Tự động hóa quản trị rủi ro**
- Hiện tại: Khách hàng phải thao tác thủ công, bỏ lỡ khi giá biến động nhanh
- Nhu cầu: Đặt trước điều kiện cắt lỗ/chốt lời, hệ thống tự động thực hiện
- Giải pháp: Trailing Stop + OCO

**2. "Set and forget" - Đặt trước kịch bản**
- Hiện tại: Phải theo dõi liên tục → Căng thẳng, bỏ lỡ khi bận
- Nhu cầu: Đặt kịch bản "nếu X thì Y", đi làm việc khác không lo
- Giải pháp: Conditional orders với logic rõ ràng

**3. Bảo vệ lợi nhuận trong xu hướng**
- Hiện tại: Chốt lời quá sớm HOẶC để giá quay đầu mất hết lời
- Nhu cầu: Stop loss tự động leo theo giá
- Giải pháp: Trailing Stop

**4. UX dễ hiểu, có hướng dẫn**
- Hiện tại: UI phức tạp → Sợ sai → Không dùng
- Nhu cầu: Visualize trên chart, có ví dụ, có cảnh báo rủi ro
- Giải pháp: Dual-mode UI, chart integration, in-context help

---

#### Root Cause Analysis

**Tại sao nhu cầu chưa được đáp ứng?**

**1. Feature Gap**
- VND chỉ có 1 loại lệnh (Stop Limit)
- Thiếu 2 lệnh cốt lõi mà thị trường đã standardize: Trailing Stop + OCO
- Value proposition yếu so với đối thủ

**2. UX/UI Barriers**
- Không trực quan hóa trên biểu đồ
- Không có in-context help tại điểm thao tác
- Phức tạp để config
- Không save preferences

**3. Thiếu Education & Onboarding**
- Không có first-time user tutorial
- Không có tooltips giải thích
- Không có example scenarios
- Khách hàng sợ sai → Không dám dùng

**4. Thiếu Tracking & Measurement**
- Không có funnel tracking đầy đủ
- Không biết khách hàng drop-off ở đâu
- Không có feedback loop để cải thiện

---

#### Kết luận Insight

**Các phát hiện chính:**

1. **Gap giữa Value và Adoption:**
   - Activation rate 54% chứng minh value khi khách hàng dùng được
   - Adoption 5.6% cho thấy rào cản lớn ở onboarding và features

2. **Pain Points cụ thể theo segment:**
   - Day Traders: Không kịp cắt lỗ khi biến động mạnh
   - Active Traders: Không thể canh bảng khi bận làm
   - Swing Traders: Thiếu kỷ luật, không rõ điểm thoát
   - → Giải pháp: Trailing Stop + OCO

3. **Thị trường đã standardize:**
   - 100% đối thủ lớn có Trailing Stop và OCO
   - VND thiếu cả 2 → Đánh giá lỗi thời
   - Risk: Khách hàng chuyển sang dùng app đối thủ

4. **Demand được validate:**
   - Điểm quan tâm: Trailing Stop (3.52/5), OCO (3.2/5)
   - Nhu cầu rõ ràng từ các segments khách hàng giao dịch chủ động

**Hành động cần thiết:**
- Build MVP với 2 lệnh (Trailing Stop + OCO) để close feature gap
- Invest vào UX/UI để giảm rào cản sử dụng
- Education là must-have: in-context help, tutorial, FAQ
- Track funnel để identify bottleneck và iterate

---
