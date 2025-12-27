# Data Governance Best Practices - Hướng Dẫn Cho Người Mới Bắt Đầu

**Report Date:** 2025-12-06
**Source:** research-notes/datawarehouse-best-practices-notes.md
**Target Audience:** Beginners in Data Management

---

## 📚 Table of Contents

1. [Data Governance là gì?](#1-data-governance-là-gì)
2. [Tại sao cần Data Governance?](#2-tại-sao-cần-data-governance)
3. [Data Quality Dimensions - 5 Tiêu Chí Chất Lượng Dữ Liệu](#3-data-quality-dimensions---5-tiêu-chí-chất-lượng-dữ-liệu)
4. [Governance Framework Components - Các Thành Phần](#4-governance-framework-components---các-thành-phần)
5. [Best Practices - Thực Hành Tốt Nhất](#5-best-practices---thực-hành-tốt-nhất)
6. [DAMA DMBOK Framework](#6-dama-dmbok-framework)
7. [Modern AI-Ready Governance](#7-modern-ai-ready-governance)
8. [Checklist Triển Khai](#8-checklist-triển-khai)

---

## 1. Data Governance là gì?

### Định nghĩa đơn giản

**Data Governance** = Tập hợp các **quy tắc, quy trình, và trách nhiệm** để quản lý dữ liệu trong tổ chức.

Giống như **luật giao thông** cho dữ liệu:
- Ai được phép truy cập dữ liệu nào?
- Dữ liệu được lưu trữ ở đâu và như thế nào?
- Ai chịu trách nhiệm khi dữ liệu sai?
- Làm sao đảm bảo dữ liệu an toàn và đúng quy định?

### Ví dụ thực tế

**Không có Data Governance:**
```
❌ 3 phòng ban có 3 cách tính doanh thu khác nhau
❌ Nhân viên Marketing truy cập được lương của mọi người
❌ Không ai biết số liệu khách hàng từ đâu ra
❌ Dữ liệu khách hàng bị leak vì không có kiểm soát
```

**Có Data Governance:**
```
✅ Doanh thu được tính theo 1 công thức duy nhất
✅ Mỗi người chỉ truy cập dữ liệu công việc cần
✅ Mọi số liệu đều có ghi chú nguồn gốc
✅ Dữ liệu nhạy cảm được mã hóa và audit log
```

---

## 2. Tại sao cần Data Governance?

### Lý do kinh doanh

| Vấn đề | Hậu quả | Data Governance giải quyết |
|--------|---------|---------------------------|
| **Dữ liệu sai** | Quyết định sai → mất tiền | Quy trình validation & quality checks |
| **Dữ liệu bị leak** | Vi phạm GDPR → phạt nặng | Access control & encryption |
| **Không tìm được data** | Lãng phí thời gian | Data catalog & metadata management |
| **Mỗi team 1 kiểu** | Báo cáo mâu thuẫn | Standardization & policies |

### Ví dụ chi phí thực tế

- **GDPR violation**: Facebook bị phạt €1.2 billion (2023)
- **Data breach**: Equifax bị phạt $575 million vì leak dữ liệu 147M người (2017)
- **Bad data decisions**: IBM ước tính doanh nghiệp Mỹ mất $3.1 trillion/năm do dữ liệu kém chất lượng

---

## 3. Data Quality Dimensions - 5 Tiêu Chí Chất Lượng Dữ Liệu

### 1️⃣ **Accuracy (Độ chính xác)**

**Khái niệm:** Dữ liệu phản ánh đúng thực tế

**Ví dụ:**
```
✅ Accurate: Email = "john@gmail.com", người dùng thực sự dùng email này
❌ Inaccurate: Email = "john@gmail.com", nhưng người dùng đã đổi sang "john@yahoo.com"
```

**Cách kiểm tra:**
- So sánh với nguồn authoritative (master data)
- Validation rules (email format, phone format)
- Cross-reference với external sources

---

### 2️⃣ **Completeness (Độ đầy đủ)**

**Khái niệm:** Tất cả dữ liệu cần thiết đều có

**Ví dụ:**
```sql
-- ❌ Incomplete record
Customer(
  id: 123,
  name: "John Doe",
  email: NULL,        -- Missing!
  phone: NULL         -- Missing!
)

-- ✅ Complete record
Customer(
  id: 123,
  name: "John Doe",
  email: "john@gmail.com",
  phone: "+84 90 123 4567"
)
```

**Cách đo:**
```
Completeness Rate = (Filled Fields / Total Required Fields) × 100%
```

---

### 3️⃣ **Consistency (Tính nhất quán)**

**Khái niệm:** Dữ liệu giống nhau ở mọi hệ thống

**Ví dụ vấn đề:**
```
Database A: Customer "John Doe", Address "123 Main St"
Database B: Customer "J. Doe", Address "123 Main Street"
Database C: Customer "John D.", Address "123 Main"

❌ Inconsistent! Cùng 1 người nhưng 3 cách ghi khác nhau
```

**Giải pháp:**
- Master Data Management (MDM) - 1 nguồn duy nhất
- Standardization rules (tất cả đều ghi "123 Main Street")
- Regular data synchronization

---

### 4️⃣ **Timeliness (Tính kịp thời)**

**Khái niệm:** Dữ liệu được cập nhật đúng lúc cần

**Ví dụ:**
```
Business case: Dashboard giám đốc cần số liệu real-time

❌ Timeliness LOW:  Data cập nhật 1 lần/tuần → Quyết định dựa trên data cũ
✅ Timeliness HIGH: Data cập nhật real-time → Quyết định dựa trên data mới nhất
```

**Các mức độ:**
- **Real-time**: <1 second (stock trading, fraud detection)
- **Near real-time**: 1-15 minutes (dashboards)
- **Batch**: Daily/Weekly (reports, analytics)

---

### 5️⃣ **Validity (Tính hợp lệ)**

**Khái niệm:** Dữ liệu tuân theo format và business rules

**Ví dụ validation rules:**
```python
# Email validation
✅ "john@gmail.com"      # Valid format
❌ "john.gmail.com"      # Invalid (missing @)

# Age validation
✅ age = 25              # Valid range
❌ age = -5              # Invalid (negative)
❌ age = 200             # Invalid (unrealistic)

# Business rule: Order date <= Delivery date
✅ order_date = 2025-01-01, delivery_date = 2025-01-05
❌ order_date = 2025-01-10, delivery_date = 2025-01-05  # Logic error!
```

---

## 4. Governance Framework Components - Các Thành Phần

### 1️⃣ **Data Governance Policies (Chính sách)**

**Là gì:** Văn bản quy định cách thu thập, lưu trữ, và sử dụng dữ liệu

**Ví dụ policies:**

```markdown
### Policy 1: Data Classification
- Public: Anyone can access (marketing materials)
- Internal: Employees only (company reports)
- Confidential: Specific roles only (financial data)
- Restricted: C-level only (M&A plans)

### Policy 2: Data Retention
- Customer data: Keep 7 years (legal requirement)
- Log data: Keep 90 days (GDPR compliance)
- Temporary data: Delete after use

### Policy 3: PII Handling
- PII must be encrypted at rest and in transit
- PII cannot be copied to local machines
- PII access requires manager approval
```

---

### 2️⃣ **Data Stewardship (Quản lý dữ liệu)**

**Là gì:** Gán **người chịu trách nhiệm** cho từng loại dữ liệu

**Organizational structure:**

```
┌─────────────────────────────────────┐
│     Chief Data Officer (CDO)        │ ← Overall responsibility
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌──────▼─────┐
│ Data Owner │    │Data Steward│
└────────────┘    └────────────┘
    │                     │
    ↓                     ↓
Domain-specific      Day-to-day
(Marketing data)     (Quality checks)
```

**Roles & Responsibilities:**

| Role | Trách nhiệm | Ví dụ |
|------|-------------|-------|
| **Data Owner** | Quyết định ai được truy cập | CMO sở hữu customer data |
| **Data Steward** | Đảm bảo chất lượng hàng ngày | Marketing analyst kiểm tra data quality |
| **Data Custodian** | Quản lý technical infrastructure | DBA manage databases |
| **Data Consumer** | Sử dụng dữ liệu đúng cách | Business analyst tạo reports |

---

### 3️⃣ **Data Cataloging (Danh mục dữ liệu)**

**Là gì:** "Google cho dữ liệu nội bộ" - tìm kiếm và hiểu dữ liệu

**Ví dụ Data Catalog entry:**

```yaml
Table: customers
Description: Customer master data from CRM system
Owner: Marketing Department
Steward: Jane Smith (jane@company.com)
Last Updated: 2025-12-05

Columns:
  - customer_id:
      Type: INTEGER
      Description: Unique customer identifier
      PII: No

  - email:
      Type: VARCHAR(255)
      Description: Customer email address
      PII: Yes (Confidential)
      Encryption: AES-256

  - lifetime_value:
      Type: DECIMAL(10,2)
      Description: Total revenue from customer
      PII: No
      Business Rule: SUM(orders.amount)

Tags: [customer, CRM, PII, marketing]
Related Tables: [orders, transactions, support_tickets]
```

**Tools:** Alation, Atlan, Azure Purview, AWS Glue Data Catalog

---

### 4️⃣ **Data Lineage (Dòng chảy dữ liệu)**

**Là gì:** Theo dõi dữ liệu từ **nguồn gốc → chuyển đổi → đích**

**Ví dụ lineage:**

```
[Salesforce CRM]
      ↓
[ETL Pipeline: clean_customer_data.py]
      ↓
[Data Warehouse: customers_bronze]
      ↓
[DBT Transform: customers_clean.sql]
      ↓
[Data Warehouse: customers_silver]
      ↓
[BI Tool: Power BI Dashboard "Customer 360"]
      ↓
[Report: "Monthly Customer Churn"]
```

**Tại sao quan trọng:**
- **Debug**: Dashboard sai → trace ngược để tìm nguồn lỗi
- **Impact analysis**: Thay đổi source system → biết reports nào bị ảnh hưởng
- **Compliance**: GDPR yêu cầu biết data của user X ở đâu

---

### 5️⃣ **Data Quality Monitoring (Giám sát chất lượng)**

**Là gì:** Tự động phát hiện vấn đề dữ liệu

**Ví dụ monitoring rules:**

```sql
-- Rule 1: Completeness check
SELECT COUNT(*) as null_emails
FROM customers
WHERE email IS NULL;
-- Alert if > 5% records

-- Rule 2: Freshness check
SELECT MAX(updated_at) as last_update
FROM customers;
-- Alert if not updated in last 24 hours

-- Rule 3: Anomaly detection
SELECT AVG(order_amount) as avg_order
FROM orders
WHERE order_date = CURRENT_DATE;
-- Alert if avg_order > 3x historical average (possible data error)

-- Rule 4: Referential integrity
SELECT COUNT(*) as orphaned_orders
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;
-- Alert if orphaned_orders > 0
```

**Tools:** Great Expectations, Monte Carlo Data, Datafold, dbt tests

---

## 5. Best Practices - Thực Hành Tốt Nhất

### ✅ Practice 1: Governance TRƯỚC, Implementation SAU

**❌ Sai:**
```
Week 1-12: Build data warehouse
Week 13: "Oh, we need governance!" (too late)
```

**✅ Đúng:**
```
Week 1-2: Define governance policies
Week 3-4: Set up data catalog & roles
Week 5-14: Build data warehouse WITH governance built-in
```

**Lý do:** Rất khó retrofit governance vào hệ thống đã chạy

---

### ✅ Practice 2: Regular Data Audits

**Tần suất:**
- **Critical data**: Monthly audits (financial, PII)
- **Important data**: Quarterly audits (customer, sales)
- **General data**: Yearly audits (logs, metadata)

**Audit checklist:**
```markdown
□ Access review: Ai truy cập data trong 90 ngày qua?
□ Quality check: Data quality metrics có giảm không?
□ Compliance check: Có vi phạm GDPR/HIPAA không?
□ Lineage validation: Lineage documentation còn chính xác?
□ Policy adherence: Teams có follow policies không?
```

---

### ✅ Practice 3: Data Validation at Ingestion

**Concept:** "Garbage in, garbage out" → Ngăn garbage NGAY từ đầu

**Implementation:**

```python
# Example: Validate customer data before loading

def validate_customer_record(record):
    errors = []

    # Check required fields
    if not record.get('email'):
        errors.append("Email is required")

    # Check format
    if record.get('email') and not is_valid_email(record['email']):
        errors.append("Invalid email format")

    # Check business rules
    if record.get('age') and (record['age'] < 0 or record['age'] > 120):
        errors.append("Invalid age range")

    # Check referential integrity
    if record.get('country_code') not in VALID_COUNTRIES:
        errors.append(f"Invalid country code: {record['country_code']}")

    return errors

# Ingestion pipeline
for record in source_data:
    errors = validate_customer_record(record)

    if errors:
        log_to_error_table(record, errors)
        send_alert(f"Data quality issue: {errors}")
    else:
        load_to_warehouse(record)
```

---

### ✅ Practice 4: Define and Track Quality Metrics

**Key metrics:**

```yaml
Data Quality Scorecard (Weekly)

Completeness:
  - customers.email: 98.5% (Target: >95%) ✅
  - customers.phone: 87.2% (Target: >90%) ❌ ALERT!

Accuracy:
  - Invalid emails: 0.3% (Target: <1%) ✅
  - Duplicate records: 2.1% (Target: <1%) ❌ ALERT!

Timeliness:
  - Avg data freshness: 15 minutes (Target: <30 min) ✅
  - SLA breach count: 0 (Target: 0) ✅

Consistency:
  - Cross-system match rate: 99.1% (Target: >99%) ✅
```

---

### ✅ Practice 5: Data Stewardship Culture

**Không phải chỉ IT responsibility, mà là EVERYONE's responsibility**

**Culture building:**

```markdown
### Monthly Data Quality Review Meeting
- Attendees: Data stewards từ mỗi department
- Agenda:
  1. Review quality metrics
  2. Discuss data issues encountered
  3. Propose policy updates
  4. Share best practices

### Data Literacy Training
- Onboarding: "How we handle data at Company X"
- Quarterly workshops: Data governance updates
- Certification: "Certified Data Steward" program

### Gamification
- Leaderboard: Teams với best data quality scores
- Rewards: "Data Quality Champion" quarterly award
```

---

### ✅ Practice 6: Use Data Profiling

**Là gì:** Tự động phân tích data để hiểu characteristics

**Ví dụ profiling output:**

```
Table: customers (10,000 records)

Column: email
- Type: STRING
- Null count: 150 (1.5%)
- Unique values: 9,850 (98.5%)
- Most common: john@gmail.com (3 occurrences)
- Pattern: 99.7% match email regex
- Recommendations: Add UNIQUE constraint

Column: age
- Type: INTEGER
- Null count: 0 (0%)
- Min: -5 ❌ ANOMALY!
- Max: 250 ❌ ANOMALY!
- Mean: 34.2
- Std Dev: 12.1
- Recommendations: Add CHECK constraint (age BETWEEN 0 AND 120)

Column: country
- Type: STRING
- Null count: 500 (5%)
- Unique values: 87
- Top 5: US (4000), UK (2000), CA (1500), AU (800), DE (700)
- Anomalies: "USA", "United States", "US" ❌ Need standardization!
```

**Tools:** Pandas Profiling, Great Expectations, Atlan

---

## 6. DAMA DMBOK Framework

### Là gì?

**DAMA DMBOK** = Data Management Body of Knowledge

- Framework **toàn diện nhất** về data management
- Vendor-neutral, industry-standard
- Được hàng ngàn companies áp dụng

### 10 Knowledge Areas

```
┌─────────────────────────────────────────┐
│     Data Governance (Central Hub)       │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴────────────┐
    │                        │
1. Data Architecture    2. Data Modeling & Design
3. Data Storage         4. Data Security
5. Data Integration     6. Document & Content Mgmt
7. Reference & Master   8. Data Warehousing & BI
9. Metadata Management  10. Data Quality
```

### Key Roles Defined

| Role | Trách nhiệm chính | Skills cần |
|------|------------------|-----------|
| **Data Architect** | Thiết kế data systems | Technical, architecture |
| **Data Steward** | Quality & compliance | Domain knowledge, policies |
| **Data Owner** | Business decisions | Business acumen, authority |
| **Data Engineer** | Build pipelines | Programming, ETL |
| **Data Analyst** | Analysis & insights | SQL, BI tools, statistics |

### Why DMBOK Matters

✅ **Common language**: Toàn team hiểu giống nhau
✅ **Best practices**: Học từ kinh nghiệm toàn industry
✅ **Career path**: Roadmap rõ ràng cho data professionals
✅ **Compliance ready**: Framework align với regulations

---

## 7. Modern AI-Ready Governance

### Tại sao cần AI-Ready Governance?

**Traditional governance** không đủ cho AI/ML workloads:

```
Traditional Data:
- Static reports
- Batch processing
- Human-reviewed

AI/ML Data:
- Real-time predictions
- Continuous learning
- Automated decisions ← Need special governance!
```

### Key Components

#### 1️⃣ **Automated Policy Enforcement**

**Traditional:**
```
Manual process: Data steward reviews access requests (2-5 days)
```

**AI-Ready:**
```python
# Automated access control
if user.role == "data_scientist" and dataset.classification == "internal":
    grant_access(user, dataset, duration="7 days")
    log_access(user, dataset)
else:
    require_approval(user, dataset, approver=dataset.owner)
```

---

#### 2️⃣ **In-Workflow Ownership & Lineage**

**Concept:** Capture metadata TRONG quá trình development, không phải sau

**Example - dbt integration:**

```yaml
# models/customers_clean.sql

{{ config(
    materialized='table',
    owner='marketing_team',
    tags=['pii', 'customer'],
    description='Cleaned customer data for analytics'
) }}

SELECT
    customer_id,
    {{ hash_pii('email') }} as email_hash,  -- Auto-track PII handling
    first_name,
    last_name
FROM {{ source('crm', 'customers') }}       -- Auto-track lineage
WHERE deleted_at IS NULL
```

**Benefit:** Lineage & ownership tự động update khi code thay đổi

---

#### 3️⃣ **Bias Detection & Drift Alerts**

**Problem:** AI models có thể bias hoặc drift over time

**Governance solution:**

```python
# Monitor model predictions for bias

def check_gender_bias(predictions_df):
    """Alert if model predictions differ by gender"""

    approval_rate_male = predictions_df[
        predictions_df['gender'] == 'M'
    ]['approved'].mean()

    approval_rate_female = predictions_df[
        predictions_df['gender'] == 'F'
    ]['approved'].mean()

    bias_ratio = approval_rate_male / approval_rate_female

    if bias_ratio > 1.2 or bias_ratio < 0.8:
        alert(f"Gender bias detected! Ratio: {bias_ratio}")
        log_to_audit_trail(predictions_df, "bias_alert")

# Data drift monitoring
def check_data_drift(current_data, baseline_data):
    """Alert if input data distribution changes"""

    drift_score = calculate_drift(current_data, baseline_data)

    if drift_score > THRESHOLD:
        alert(f"Data drift detected! Score: {drift_score}")
        trigger_model_retraining()
```

---

#### 4️⃣ **Model-Card Snapshots**

**Concept:** Document model như document code (như README cho models)

**Example Model Card:**

```yaml
Model: credit_risk_classifier_v2.1

Metadata:
  - Created: 2025-11-15
  - Owner: Risk Analytics Team
  - Trained by: jane.smith@company.com
  - Framework: XGBoost 1.7.0

Training Data:
  - Source: customers_silver.credit_applications
  - Date Range: 2020-01-01 to 2024-12-31
  - Records: 1,500,000
  - Features: 47 (see feature_list.json)
  - PII Handling: Removed before training

Performance:
  - AUC-ROC: 0.89
  - Precision: 0.85
  - Recall: 0.82
  - Tested on: 2025-01 holdout set

Bias Testing:
  - Gender bias: 1.02 (acceptable < 1.1)
  - Age bias: 0.98 (acceptable)
  - Geography bias: 1.15 (ALERT: review needed)

Governance:
  - Approval: CCO approved 2025-11-20
  - Review Cycle: Quarterly
  - Next Review: 2025-02-20
  - Compliance: Meets Fair Lending requirements
```

**Storage:** Version controlled (Git), auto-generated at deployment

---

## 8. Checklist Triển Khai

### Phase 1: Foundation (Month 1-2)

```markdown
□ Establish Data Governance Committee
  - Assign Chief Data Officer (or equivalent)
  - Recruit data stewards from each department
  - Schedule monthly governance meetings

□ Define Data Classification Scheme
  - Public / Internal / Confidential / Restricted
  - Document what falls into each category

□ Create Initial Policies
  - Data access policy
  - Data retention policy
  - PII handling policy
  - Data quality standards

□ Set Up Data Catalog
  - Choose tool (Alation, Atlan, etc.)
  - Document top 10 most critical datasets
  - Define metadata standards
```

---

### Phase 2: Implementation (Month 3-4)

```markdown
□ Implement Access Controls
  - RBAC setup in all data systems
  - Row-level security for sensitive data
  - Audit logging enabled

□ Deploy Data Quality Monitoring
  - Set up Great Expectations or similar
  - Define quality tests for critical datasets
  - Create alerting workflows

□ Build Data Lineage
  - Integrate lineage tracking into ETL pipelines
  - Document lineage for top 20 reports
  - Set up automated lineage capture

□ Training & Onboarding
  - Train all data stewards
  - Create governance documentation
  - Add governance to employee onboarding
```

---

### Phase 3: Scaling (Month 5-6)

```markdown
□ Expand Data Catalog Coverage
  - Document all production datasets
  - Add business glossary
  - Enable self-service data discovery

□ Automate Governance
  - Auto-classification of new datasets
  - Automated policy enforcement
  - Self-service access requests

□ Quality Metrics & Reporting
  - Weekly quality scorecards
  - Executive dashboard for governance KPIs
  - Trend analysis and continuous improvement

□ Advanced Governance
  - AI/ML governance for models
  - Bias detection in production
  - Real-time compliance monitoring
```

---

### Phase 4: Optimization (Ongoing)

```markdown
□ Regular Audits
  - Quarterly access reviews
  - Annual policy updates
  - Continuous quality improvement

□ Culture & Adoption
  - Celebrate data quality wins
  - Share best practices across teams
  - Gamify governance participation

□ Technology Updates
  - Evaluate new governance tools
  - Integrate with emerging platforms
  - Stay current with regulations
```

---

## 🎯 Key Takeaways

### Top 5 Điều Cần Nhớ

1. **Governance TRƯỚC, Technology SAU**
   - Policy → Process → Tools (not the reverse!)

2. **Không chỉ là IT job**
   - Business phải involved, data stewards từ mỗi department

3. **Start small, scale gradually**
   - Pilot với 1-2 critical datasets trước khi rollout toàn bộ

4. **Automate everything có thể**
   - Manual governance không scale, invest in automation

5. **Measure & improve continuously**
   - Track metrics, learn from issues, iterate policies

---

## 📚 References

Based on research notes from:
- Modern Data 101
- Improvado
- GeeksforGeeks
- Alation
- Atlan
- DAMA International (DMBOK Framework)

**Additional Resources:**
- DAMA DMBOK v2: https://www.dama.org/
- GDPR Compliance: https://gdpr.eu/
- Great Expectations (Data Quality): https://greatexpectations.io/

---

**Document Version:** 1.0
**Last Updated:** 2025-12-06
**Next Review:** 2026-03-06
