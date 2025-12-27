# Delta Lake vs Apache Iceberg vs Apache Hudi - Comprehensive Comparison

**Date:** December 5, 2025

---

## 📊 Executive Summary

| Feature | Delta Lake | Apache Iceberg | Apache Hudi |
|---------|-----------|----------------|-------------|
| **Creator** | Databricks | Netflix | Uber |
| **Open Source** | 2019 | 2018 | 2016 |
| **License** | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| **Primary Use** | General lakehouse | Analytics-heavy | Streaming + CDC |
| **Best For** | Databricks users | Multi-engine flexibility | Real-time updates |
| **Maturity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Adoption** | High (Databricks lock-in) | Growing fast | Moderate |

---

## 🎯 Origin Stories

### Delta Lake (Databricks, 2019)
```
Problem at Databricks:
- Data Lake quá messy (no ACID)
- Customers complain về data quality
- Cannot update/delete in Data Lake

Solution:
→ Build transaction layer on top of Parquet
→ Open-sourced as "Delta Lake"
→ Become foundation of "Lakehouse" concept
```

**Design Philosophy:**
- Simplicity first
- Optimize for Spark
- Strong integration với Databricks platform

---

### Apache Iceberg (Netflix, 2018)
```
Problem at Netflix:
- Petabyte-scale tables (100B+ rows)
- Hive tables too slow
- Need hidden partitioning (user không cần biết)
- Multi-engine support (Spark, Flink, Trino, etc)

Solution:
→ Design table format from scratch
→ Engine-agnostic architecture
→ Advanced metadata management
```

**Design Philosophy:**
- Scale to extreme sizes (petabytes)
- Engine neutrality (không favor Spark)
- Hidden partitioning (better UX)

---

### Apache Hudi (Uber, 2016)
```
Problem at Uber:
- Ride data need REAL-TIME updates
- Cannot wait hours for batch
- Need incremental processing
- CDC (Change Data Capture) from databases

Solution:
→ Merge-on-Read + Copy-on-Write strategies
→ Timeline service for time travel
→ Optimize for streaming writes
```

**Design Philosophy:**
- Streaming-first mindset
- CDC and incremental processing
- Minutes to hours latency (not seconds)

---

## 🏗️ Architecture Deep Dive

### 1. File Organization

**Delta Lake:**
```
s3://bucket/table/
├── _delta_log/              ← Transaction log (JSON)
│   ├── 00000.json           ← Version 0
│   ├── 00001.json           ← Version 1
│   ├── 00002.json
│   └── 00010.checkpoint.parquet  ← Checkpoint every 10
├── part-00000.parquet
├── part-00001.parquet
└── part-00002.parquet

Delta Log entry example:
{
  "add": {
    "path": "part-00001.parquet",
    "size": 12345,
    "modificationTime": 1234567890,
    "stats": "{min: {...}, max: {...}}"
  }
}
```

**Apache Iceberg:**
```
s3://bucket/table/
├── metadata/
│   ├── v1.metadata.json     ← Version 1 metadata
│   ├── v2.metadata.json     ← Version 2 metadata
│   ├── snap-123.avro        ← Snapshot manifest list
│   └── manifest-456.avro    ← Manifest files
├── data/
│   ├── part-00000.parquet
│   └── part-00001.parquet

Iceberg has 3 layers:
1. Metadata file (table config + snapshots)
2. Manifest list (list of manifest files)
3. Manifest files (list of data files + stats)
```

**Apache Hudi:**
```
s3://bucket/table/
├── .hoodie/                 ← Hoodie metadata
│   ├── hoodie.properties
│   ├── 20231201120000.commit
│   ├── 20231201130000.commit
│   └── archived/            ← Old commits archived
├── 2023/12/01/             ← Hive-style partitions
│   ├── base-file-1.parquet  ← Base data (COW)
│   ├── log-file-1.log       ← Updates (MOR)
│   └── log-file-2.log

Two storage types:
- Copy-On-Write (COW): Update creates new Parquet
- Merge-On-Read (MOR): Updates go to log files
```

---

## 🔥 Feature Comparison Matrix

| Feature | Delta Lake | Iceberg | Hudi |
|---------|-----------|---------|------|
| **ACID Transactions** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Time Travel** | ✅ Yes (30 days default) | ✅ Yes (unlimited) | ✅ Yes (via Timeline) |
| **Schema Evolution** | ✅ Add, rename, delete | ✅ Full support | ✅ Add, delete |
| **Hidden Partitioning** | ❌ No (user must specify) | ✅ Yes (automatic) | ❌ No |
| **Partition Evolution** | ⚠️ Limited | ✅ Yes (change anytime) | ⚠️ Limited |
| **UPSERT/MERGE** | ✅ MERGE INTO | ✅ MERGE INTO | ✅ Native (optimized) |
| **DELETE** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Streaming Writes** | ✅ Spark Streaming | ✅ Flink, Spark | ✅⭐ Best-in-class |
| **Incremental Read** | ✅ Yes | ✅ Yes | ✅⭐ Excellent |
| **Compaction** | ✅ OPTIMIZE | ✅ Manual/auto | ✅⭐ Auto + Manual |
| **Small Files Problem** | ⚠️ Manual OPTIMIZE | ⚠️ Manual compact | ✅⭐ Auto clustering |
| **Z-Ordering** | ✅ OPTIMIZE ZORDER | ❌ Not built-in | ✅ Clustering |
| **Vacuum (cleanup)** | ✅ VACUUM | ✅ expire_snapshots | ✅ Clean |

### Legend:
- ✅ Full support
- ✅⭐ Best-in-class
- ⚠️ Partial/requires work
- ❌ Not supported

---

## 🚀 Performance Comparison

### 1. Write Performance

**Scenario: Append 100M new rows**

```
Delta Lake:  ████████████░░░░  75/100  (Good)
- Optimized for Spark
- Transaction log overhead minimal
- Good for batch writes

Iceberg:     ██████████████░░  85/100  (Better)
- Multiple manifest files (parallel write)
- Better for distributed writes
- Snapshot isolation

Hudi (MOR):  ████████████████  95/100  (Best)
- Log-based writes (no rewrite Parquet)
- Fastest for streaming
- Trade-off: slower reads until compaction
```

### 2. Update/Delete Performance

**Scenario: Update 1M rows in 1B row table**

```
Delta Lake:  ████████░░░░░░░░  50/100
- Must rewrite entire Parquet file
- Better after OPTIMIZE

Iceberg:     ██████████░░░░░░  60/100
- Position delete files (better than rewrite)
- Still requires compaction

Hudi (MOR):  ██████████████░░  85/100  (Best)
- Updates go to log files (fast)
- Read amplification trade-off
```

### 3. Read Performance

**Scenario: Full table scan (analytics query)**

```
Delta Lake:  ████████████████  95/100  (Best)
- Direct Parquet reads
- Stats pruning excellent
- Z-order optimization

Iceberg:     ████████████████  95/100  (Best)
- Manifest pruning very efficient
- Columnar stats
- Hidden partitioning helps

Hudi (COW):  ████████████████  95/100
Hudi (MOR):  ██████████░░░░░░  60/100  (Before compaction)
- Must merge base + logs
- After compaction = COW performance
```

### 4. Point Query Performance

**Scenario: SELECT * WHERE id = 'xyz'**

```
All three similar if partitioned correctly
Delta/Iceberg: ████████████░░  75/100
Hudi:         ████████████░░  75/100

With indexing:
Hudi + Bloom filters: ██████████████░░  85/100
```

---

## 🔧 Engine Support

### Delta Lake

| Engine | Support Level | Notes |
|--------|--------------|-------|
| **Spark** | ✅⭐⭐⭐⭐⭐ | Native, best support |
| **Flink** | ⚠️⚠️ | Via Delta connector, limited |
| **Trino** | ✅✅✅ | Good read support |
| **Presto** | ✅✅✅ | Via connector |
| **Hive** | ❌ | Not supported |
| **DuckDB** | ✅✅ | Read-only |

**Lock-in Risk:** High (Spark/Databricks-centric)

---

### Apache Iceberg

| Engine | Support Level | Notes |
|--------|--------------|-------|
| **Spark** | ✅⭐⭐⭐⭐⭐ | Full support |
| **Flink** | ✅⭐⭐⭐⭐⭐ | Full support |
| **Trino** | ✅⭐⭐⭐⭐⭐ | Native support |
| **Presto** | ✅⭐⭐⭐⭐ | Good support |
| **Hive** | ✅✅✅ | Via IcebergStorageHandler |
| **Dremio** | ✅⭐⭐⭐⭐⭐ | Native |
| **DuckDB** | ✅✅✅✅ | Growing support |

**Lock-in Risk:** Low (designed for multi-engine)

---

### Apache Hudi

| Engine | Support Level | Notes |
|--------|--------------|-------|
| **Spark** | ✅⭐⭐⭐⭐⭐ | Native, best support |
| **Flink** | ✅⭐⭐⭐⭐ | Good support |
| **Trino** | ✅✅✅ | Read support |
| **Presto** | ✅✅✅ | Via connector |
| **Hive** | ✅✅✅✅ | Good integration |
| **DuckDB** | ⚠️ | Limited |

**Lock-in Risk:** Medium (Spark-optimized but others ok)

---

## 🎪 Ecosystem & Cloud Support

### Delta Lake
```
Cloud Support:
✅ Databricks (native, best)
✅ AWS: EMR, Glue
✅ Azure: Synapse, Databricks
✅ GCP: Dataproc
⚠️ Confluent: Limited

Catalog Support:
✅ Unity Catalog (Databricks)
✅ AWS Glue
✅ Hive Metastore
❌ No Nessie support
```

### Apache Iceberg
```
Cloud Support:
✅ AWS: Athena, EMR, Glue (excellent)
✅ Azure: Synapse (growing)
✅ GCP: BigQuery (preview), Dataproc
✅ Snowflake: Iceberg tables (2024)
✅ Confluent: Tableflow

Catalog Support:
✅ AWS Glue ⭐
✅ Hive Metastore
✅ Nessie (versioned catalog)
✅ REST Catalog
✅ JDBC Catalog
```

### Apache Hudi
```
Cloud Support:
✅ AWS: EMR, Glue
✅ Azure: Synapse, HDInsight
✅ GCP: Dataproc
⚠️ Less first-party cloud support

Catalog Support:
✅ Hive Metastore
✅ AWS Glue
⚠️ Limited REST catalog
```

---

## 💡 Use Case Decision Matrix

### Choose **Delta Lake** when:

✅ **You're using Databricks**
- Native integration, best performance
- Unity Catalog for governance

✅ **Spark-centric environment**
- 90%+ workloads are Spark
- Don't need Flink/Trino heavily

✅ **Simplicity matters**
- Want "it just works" experience
- Less config than Hudi

✅ **Z-Ordering important**
- Need advanced data skipping
- Analytics-heavy workloads

**Example Companies:** Microsoft, Comcast, ABN AMRO

---

### Choose **Apache Iceberg** when:

✅ **Multi-engine requirement**
- Using Spark + Trino + Flink
- Want engine neutrality

✅ **Avoid vendor lock-in**
- Don't want to commit to Databricks
- Open ecosystem preferred

✅ **Massive scale**
- Petabyte+ tables
- Billions+ partitions

✅ **Hidden partitioning needed**
- Users shouldn't know partition scheme
- Can change partitioning without rewrite

✅ **Time travel critical**
- Need long retention (years)
- Regulatory requirements

**Example Companies:** Netflix, Apple, Adobe, Airbnb, LinkedIn

---

### Choose **Apache Hudi** when:

✅ **Streaming + CDC workloads**
- Kafka → Data Lake pipeline
- Database CDC replication
- Near-real-time updates

✅ **Frequent updates/deletes**
- MOR (Merge-On-Read) shines here
- Order management, inventory systems

✅ **Incremental processing**
- Only process changed data
- ETL optimization

✅ **Small file management**
- Auto-compaction & clustering
- Less manual optimization

**Example Companies:** Uber, Robinhood, Amazon, Disney+

---

## 🏆 Head-to-Head Comparison

### Scenario 1: Analytics Dashboard (Read-heavy)

```
Workload:
- 1 write/hour
- 1000 reads/minute
- Need fast query response

Winner: Delta Lake / Iceberg (tie)
────────────────────────────────
Delta: Z-ordering + stats = excellent
Iceberg: Manifest pruning = excellent
Hudi: COW mode ok, MOR slower
```

### Scenario 2: Real-time Data Lake (Write-heavy)

```
Workload:
- Streaming from Kafka
- 100K events/sec
- Updates existing records

Winner: Hudi ⭐
────────────────────────────────
Hudi MOR: Writes to log files (fast)
Delta: Must rewrite Parquet (slower)
Iceberg: Better than Delta, not as fast as Hudi
```

### Scenario 3: Multi-Engine Analytics Platform

```
Workload:
- Spark for ETL
- Trino for ad-hoc queries
- Flink for streaming
- Presto for BI

Winner: Iceberg ⭐
────────────────────────────────
Iceberg: Native support all engines
Delta: Spark great, others ok
Hudi: Spark/Flink good, Trino limited
```

### Scenario 4: Databricks-Exclusive Environment

```
Workload:
- All Spark
- Using Unity Catalog
- Need Databricks features

Winner: Delta Lake ⭐
────────────────────────────────
Delta: Native, best integration
Iceberg: Works but not optimized
Hudi: Works but not native
```

---

## 🔮 Future Trends (2025-2026)

### Delta Lake
```
✅ UniForm (Delta ↔ Iceberg interop)
✅ Better Flink support
✅ Liquid Clustering (alternative to Z-order)
⚠️ Still Databricks-centric
```

### Apache Iceberg
```
✅ Most momentum in open-source
✅ Snowflake, BigQuery adoption growing
✅ Puffin spec (stats format)
✅ Becoming "default choice" for new projects
⭐ Fastest growth
```

### Apache Hudi
```
✅ Better Flink integration
✅ Hudi 1.0 with stability improvements
⚠️ Less marketing than others
⚠️ Perception: "streaming only"
```

**Industry Trend:** Converging on Iceberg as multi-engine standard

---

## 📝 Migration Considerations

### From Hive/Parquet → ?

```
Best Path: Iceberg or Delta
- Both have excellent migration tools
- Iceberg: More portable
- Delta: Better if Databricks
```

### From Delta → Iceberg

```
Databricks UniForm (2023+):
- Write Delta, read as Iceberg
- Best of both worlds
- One-way conversion tools available
```

### From Iceberg → Delta

```
Possible but harder:
- Manual data copy + schema conversion
- No official tooling
- Not recommended
```

### From Hudi ↔ Others

```
Difficult:
- Hudi's MOR format unique
- Need to compact to COW first
- Then export/import
```

---

## 🎓 Learning Curve

| Aspect | Delta | Iceberg | Hudi |
|--------|-------|---------|------|
| **Setup** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Complex |
| **Concepts** | ⭐⭐⭐⭐⭐ Simple | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Many concepts |
| **Operations** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐ Moderate | ⭐⭐⭐ Need tuning |
| **Troubleshoot** | ⭐⭐⭐⭐ Good docs | ⭐⭐⭐ Ok docs | ⭐⭐ Complex |

---

## 🏁 Final Recommendation

### TL;DR Decision Tree:

```
START
  │
  ├─ Using Databricks?
  │   └─ YES → Delta Lake ⭐
  │   └─ NO ↓
  │
  ├─ Need multi-engine (Spark + Trino + Flink)?
  │   └─ YES → Iceberg ⭐
  │   └─ NO ↓
  │
  ├─ Heavy streaming + CDC workloads?
  │   └─ YES → Hudi ⭐
  │   └─ NO ↓
  │
  └─ Default choice for new project?
      └─ Iceberg ⭐ (most portable)
```

### My Personal Recommendation (2025):

**🥇 For most new projects: Apache Iceberg**
- Reason: Most portable, growing ecosystem, no lock-in

**🥈 If using Databricks: Delta Lake**
- Reason: Native integration, best UX

**🥉 For streaming-first: Apache Hudi**
- Reason: Best streaming performance, CDC optimized

---

## 📚 References

- Delta Lake: https://delta.io
- Apache Iceberg: https://iceberg.apache.org
- Apache Hudi: https://hudi.apache.org
- Databricks UniForm: https://docs.databricks.com/delta/uniform.html

---

*Report compiled: December 5, 2025*
