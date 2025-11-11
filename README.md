# das-platform-demo

Demo platform architecture on dbt, AWS, and Snowflake (snf)

- Data mesh = an operating model where domains own **data-as-a-product** under **federated, computational governance**.
- Data microservices = the delivery unit; **collectors** are the ingress-focused data microservices that land app/platform data reliably.
- **Compliance-first architecture** = HIPAA/SOC 2 controls are designed-in (not bolted on): classification, least-privilege, masking/row access, auditability, tested contracts, and cost/risk guardrails baked into CI/CD.
- On **Snowflake + dbt + AWS**, use: domain databases/schemas, Snowpipe/Snowpipe Streaming, Streams & Tasks, Dynamic Tables, **tags/masking/row access policies**, network policies, Resource Monitors, and **evidence-as-code** from dbt artifacts + ACCESS_HISTORY.

## 2.0 Map the ideas (Snowflake + dbt, compliance-first)

### 2.1 Principles → Brook moves

- Domain ownership → one Snowflake **database per domain** (e.g., `BROOK_COMMERCE`), schemas by tier (`BRONZE/SILVER/PLATINUM/OPS`).
- Data as a product → each product has a **contract, SLOs, and classification** (PHI/PII/business-confidential).
- Self-serve platform → Snowpipe/Streaming, Streams & Tasks, Dynamic Tables, Snowpark; transforms in dbt.
- Federated computational governance → **policies-as-code** (tags, masking, row access), PR-gated tests, lineage, and **automatic evidence capture** for SOC 2.
- **Minimum necessary access** → roles scoped by domain + tier; dev/stage/prod isolation; break-glass with expiry and audit.
- **Encryption & network boundaries** → TLS in transit, encrypted stages (SSE-KMS), PrivateLink/allowlists via Snowflake **NETWORK POLICY**.

### 2.2 Data microservices in the mesh (with collectors)

- Interfaces: curated Snowflake tables/views, **Secure Data Sharing**, feature tables, and privacy-preserving views.
- Storage: columnar **Delta-like** patterns on Snowflake tables with **Time Travel** for controlled replay/backfill (set **retention** to policy).
- Versioning: semantic versions + contract history in git; **deprecation plans** enforced by CI.

### 2.3 Collectors (first-class, compliance-aware)

- Purpose: move app/platform events into **HIPAA-eligible Snowflake** accounts under BAA with **idempotency** and **schema governance**.
- Sources: outbox (OLTP), CDC (Debezium), Kafka topics, S3 logs, Kinesis/Firehose, HTTP event gateways.
- Controls in collectors:
  - **Schema registry + validation** (Avro/Protobuf/JSON).
  - **PII/PHI detection** (patterns/tags) before landing; route to **encrypted stages**.
  - **Late-arrival policy**, DLQ, and replay with **auditable** dedupe keys.
- Sinks: Snowpipe/Snowpipe Streaming → `BRONZE`; Streams/Tasks/Dynamic Tables → `SILVER/PLATINUM` (with tests and policies).

## 3.0 Reference architecture (Snowflake + dbt) with control points

### 3.1 Layout

- Databases: `BROOK_<DOMAIN>` (e.g., `BROOK_COMMERCE`, `BROOK_HEALTH`).
- Schemas: `BRONZE`, `SILVER`, `PLATINUM`, `OPS` (quality/observability/compliance).
- Warehouses: `INGEST_WH`, `TRANSFORM_WH`, `SERVE_WH` with **Resource Monitors** and tagging (env/domain/cost center).
- Network: **NETWORK POLICY**; PrivateLink/allowlists; no public stages for PHI.
- Sharing: **Secure Data Sharing** (internal) and **Reader Accounts** with masking/row policies applied.

### 3.2 Patterns (with compliance hooks)

- Ingest:
  - `CREATE STAGE` (SSE-KMS), `CREATE PIPE` (Snowpipe) with S3 notifications or Snowpipe Streaming/Kafka Connector.
  - Outbox + Debezium → Kafka → Snowflake Kafka Connector (service account with least privilege).
- Transform:
  - dbt models → `SILVER` (clean) and `PLATINUM` (consumer-grade) with **contracts/tests**; use **Dynamic Tables** for incremental freshness.
  - **De-identification** macros for Safe Harbor-style removal/tokenization where required.
- Serve:
  - Privacy-preserving views; **row access** and **masking**; **Secure Shares** gated by policy + approval workflow.
- Observe:
  - `ACCOUNT_USAGE`/`ORGANIZATION_USAGE`, **ACCESS_HISTORY/LOGIN_HISTORY/QUERY_HISTORY**, dbt artifacts, lineage, and cost in `OPS`.

## 4.0 Collectors flow (Brook)

### 4.1 End-to-end

- App/platform microservice → outbox/event → Kafka/S3/Kinesis → Snowpipe/Streaming → `BROOK_<DOMAIN>.BRONZE`
- `STREAM` on BRONZE → `TASK`/Dynamic Table → `SILVER`
- dbt → `PLATINUM` with **SLOs**, **tags**, **masking/row policies**, and **contracts**

### 4.2 Collector + product contract (adds compliance)

```yaml
name: orders_core
domain_database: BROOK_COMMERCE
schemas: {bronze: BRONZE, silver: SILVER, platinum: PLATINUM, ops: OPS}
owners: [data-commerce@brookhealth.com]

classification: PHI-pseudonymous
legal_basis: treatment_operations
retention_policy:
  bronze: 30d
  silver: 400d
  platinum: 5y
security_controls:
  masking_policy: MASK_EMAIL
  row_access_policy: ORDER_REGION
  network_policy: INTERNAL_ONLY_V1
  roles_allowed: [ANALYST_PHI, DATA_SCI_COMMERCE]
audit_evidence:
  - access_history: enabled
  - dbt_tests: required
  - lineage: required

interfaces:
  tables: [BROOK_COMMERCE.PLATINUM.ORDERS]
  shares: [BROOK_COMMERCE_SHARE]

collectors:
  - name: orders_events_v1
    source: kafka://orders.v1
    schema_format: avro
    key: order_id
    dedupe_keys: [order_id, event_ts]
    lateness: "allow 24h; watermark 2h"
    dlq: kafka://orders.dlq

quality_slo:
  freshness_p95: "<=10m"
  completeness: "null_rate(total_usd) <= 0.1%"
  drift_psi: "<=0.1 for total_usd"

cost:
  monthly_cap_usd: 1200
  tags: {cost_center: CC-123, env: prod, domain: commerce}

lineage:
  sources: [kafka:orders.v1, s3://brook-logs/orders/*]
  transforms: [stream:BRONZE.ORDERS_RAW, dbt:STG_ORDERS, dbt:DIM_ORDERS]

deprecation:
  replaces: orders_core_v2
  sunset: 2026-03-31
```

## 5.0 Policy examples (Snowflake)

```sql
-- Tags
CREATE TAG IF NOT EXISTS pii COMMENT='PII/PHI classification';
ALTER TABLE BROOK_COMMERCE.PLATINUM.ORDERS SET TAG pii='pseudonymous';

-- Masking (dynamic)
CREATE OR REPLACE MASKING POLICY MASK_EMAIL AS (val STRING) RETURNS STRING ->
  IFF(IS_ROLE_IN_SESSION('ANALYST_PHI'), val, REGEXP_REPLACE(val,'.+(@.*)','#***\\1'));
ALTER TABLE BROOK_COMMERCE.PLATINUM.ORDERS MODIFY COLUMN CUSTOMER_EMAIL SET MASKING POLICY MASK_EMAIL;

-- Row access (minimum necessary)
CREATE OR REPLACE ROW ACCESS POLICY ORDER_REGION AS (region STRING) RETURNS BOOLEAN ->
  CASE WHEN CURRENT_ROLE() IN ('REGION_ADMIN','SYSADMIN') THEN TRUE
       WHEN CURRENT_ROLE() = 'ANALYST_EMEA' THEN region='EMEA'
       ELSE FALSE END;
ALTER TABLE BROOK_COMMERCE.PLATINUM.ORDERS ADD ROW ACCESS POLICY ORDER_REGION ON (REGION);

-- Network policy (restrict to corporate/PrivateLink ranges)
CREATE OR REPLACE NETWORK POLICY INTERNAL_ONLY_V1
ALLOWED_IP_LIST=('10.0.0.0/8','198.51.100.0/24');
ALTER ACCOUNT SET NETWORK POLICY = INTERNAL_ONLY_V1;
```

## 6.0 dbt: contracts, tests, and de-identification

```sql
-- models/platinum/dim_orders.sql
{{ config(
  materialized='table',
  contract=true,
  meta={
    "sf.domain":"commerce",
    "sf.classification":"PHI-pseudonymous",
    "slo.freshness_p95":"10m"
  },
  tags=["platinum","orders"],
  constraints={"primary_key": ["order_id"]}
) }}
select
  order_id,
  customer_id,           -- pseudonymous
  {{ mask_email('customer_email') }} as customer_email,  -- macro enforces masking
  status,
  total_usd,
  region
from {{ ref('stg_orders') }}
```

```yml
# models/schema.yml
models:
  - name: dim_orders
    tests:
      - not_null: {column_name: order_id}
      - unique: {column_name: order_id}
      - accepted_values: {column_name: status, values: ['created','paid','shipped','canceled']}
      - relationships: {to: ref('stg_orders'), field: order_id}
    meta:
      classification: PHI-pseudonymous
      policy_required: [masking, row_access]
```

```sql
-- Example macro: macros/mask_email.sql
{% macro mask_email(col) -%}
  -- enforce masking even in dev (no PHI in lower envs)
  CASE
    WHEN current_role() in ('ANALYST_PHI','SYSADMIN') THEN {{ col }}
    ELSE REGEXP_REPLACE({{ col }}, '.+(@.*)', '#***\\1')
  END
{%- endmacro %}
```

## 7.0 CI/CD guardrails (every PR) with SOC 2 evidence

- Build + `dbt test` (contracts, constraints, custom governance tests) → **fail PR** on regression.
- Schema diff vs prior contract; **breaking changes require steward + Security approval**.
- Verify PHI/PII columns have **tags + masking/row access**; block if missing.
- Enforce **no PHI in dev**: compile-time checks for masked macros; deploy-time role policies.
- Capture **evidence artifacts**: dbt run/test logs, manifest.json, lineage graph, policy diffs, Access History snapshots.
- Lint SQL (sqlfluff); run cost estimate from prior `QUERY_HISTORY`; attach to PR.

## 8.0 Mesh-wide observability (with compliance signals)

- Freshness P50/P95 per product; Dynamic Table **TARGET_LAG** vs SLO.
- Completeness and nulls; **distribution drift** (PSI/KS).
- Lineage coverage (% models mapped) and **policy coverage** (% columns with required tags/masking).
- Reliability: Task success rate, failed loads, MTTR.
- Adoption: distinct roles/queries reading `PLATINUM`.
- Cost: credits by domain/tier; **Resource Monitor** alerts.
- Security: failed logins, network policy hits, **queries touching PHI** (ACCESS_HISTORY), **SELECT \\*** audits.

## 9.0 Operating rhythms (governance-as-ops)

- Weekly domain review: SLOs, incidents, cost, **policy violations**.
- Monthly governance: approve breaking changes, certify `PLATINUM` sets, **access exceptions** audit.
- Quarterly: HIPAA/SOC 2 **control walkthrough** (change mgmt, access reviews, incident drills), warehouse right-sizing, share hygiene.

## 10.0 30/60/90 rollout (Snowflake, compliance-first)

### 30 days

- Execute BAA for HIPAA account(s); create domain databases/schemas, roles, warehouses, **NETWORK POLICY**.
- Build two **collectors** (Orders, Auth) to BRONZE; ship three `PLATINUM` tables via dbt with contracts; enable **masking/row access**.
- Stand up SLO dashboard + evidence store in `OPS` (tests, logs, Access History snapshots).

### 60 days

- Enforce PR rules for **breaking schema**; add **drift checks**; start **Secure Shares** with policy gating.
- **Cost showback** per domain; Resource Monitors; alerting on policy violations.

### 90 days

- Automated deprecation; certification rubric; **incident playbooks** for backfills/late data; DLP/egress watch (SELECT * on PHI, large downloads).

## 11.0 Anti-patterns to avoid

- Skipping collectors/CDC (analytics reading OLTP directly).
- PHI in dev/test; public network paths; unmanaged external stages.
- Unversioned breaking schema changes; shares without masking/row policies.
- Over-long Time Travel conflicting with **retention policies**.

## 12.0 Role alignment (your description → this model)

- Strategy: design domain layout, warehouse strategy, Streams/Tasks/Dynamic Tables, **control framework**.
- Modeling/architecture: define `BRONZE/SILVER/PLATINUM`, star/SCD, **de-identification patterns**.
- Technical leadership: Snowflake + dbt + AWS; Kafka/Kinesis; Snowpipe design; **network/keys/secrets** alignment.
- Team: staff domain product teams + small platform core; train on **contracts/tests/policies**.
- Quality/observability: dbt tests, **compliance dashboards**, `ACCOUNT_USAGE/ACCESS_HISTORY`.
- Cross-functional: align Analytics/AI/ML/Product on **PLATINUM** datasets and privacy-preserving interfaces.
- Best practices: CI/CD with **governance gates**, sqlfluff, schemachange; **cost + risk** monitors and showback.
- Complex workflows: review PRs for collectors/CDC/backfills/perf; Snowpark where needed.
- Modernization/scalability: Dynamic Tables, Snowpipe Streaming, Secure Sharing; hybrid (External Tables/Iceberg) by policy.
- Hands-on: 60% in code/SQL/dbt/infra + **incident response**.
- AI-assist: anomaly detection (freshness/completeness), **schema drift**, masking suggestions, **suspicious query detection**.

## 13.0 Next steps (pilot, compliance-first)

- Stand up two collectors: `orders_events_v1`, `auth_events_v1`.
- Ship three `PLATINUM` datasets with contracts + **policies**: `ORDERS`, `CUSTOMERS_SCD`, `SESSIONS`.
- Enforce tags + masking; wire CI gates; publish SLO/compliance dashboard; enable a **Secure Share** to one internal consumer.
