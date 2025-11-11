# System Patterns: DAS Platform Demo

## System Architecture

### High-Level Architecture

```m
[Source Systems] ── Collectors ──> [BRONZE] ── Tasks/Streams ──> [SILVER] ── dbt ──> [PLATINUM]
       │                                                           │
       └───────────────── Policies Applied ────────────────────────┘
```

### Component Relationships

- **Domain Ownership**: Each business domain (`BROOK_COMMERCE`, `BROOK_HEALTH`) owns their database with 4-tier schema architecture
- **Federated Governance**: Platform team provides global policies; domain teams customize per needs
- **Data Flow**: Linear progression from raw ingestion to consumer-grade products
- **Security Layers**: Network → Access → Column (authentication → authorization → de-identification)

### Database Architecture

#### Schema Tiers

- **BRONZE**: Raw data landing zone
  - Tables: Raw event streams, no transformations
  - Policies: Minimal (network access only)
  - Retention: Short (30d default)
  - Usage: Internal processing, audit trails

- **SILVER**: Cleaned, standardized data
  - Tables: Deduplicated, type-safe, enriched
  - Policies: Domain-internal access, basic masking
  - Retention: Medium (400d default)
  - Usage: Domain analysis, feature tables

- **PLATINUM**: Consumer-grade datasets
  - Tables: Contract-compliant, aggregation-ready
  - Policies: Row access, masking, secure sharing
  - Retention: Long (5y default)
  - Usage: Analytics, ML, external consumers

- **OPS**: Observability & Compliance
  - Tables: SLO metrics, evidence artifacts, audit logs
  - Policies: Compliance team access only
  - Retention: Configurable per evidence type
  - Usage: Monitoring, certification, forensics

#### Warehouse Isolation

- `INGEST_WH`: Reserved for Snowpipe/Streaming ingestion
- `TRANSFORM_WH`: Dedicated to Tasks/Streams/Dynamic Tables
- `SERVE_WH`: Workstation for analytical queries and sharing

### Critical Implementation Paths

#### Data Ingest Path

1. **Source Collection**: Kafka/S3/Kinesis event consumption
2. **Schema Validation**: Avro/Protobuf verification against registry
3. **PII Detection**: Pattern-based scanning before landing
4. **Idempotent Landing**: Deduplication key handling
5. **Stream Processing**: Automatic promotion to SILVER tier

#### Transformation Pipeline

1. **Incremental Processing**: Streams on BRONZE enable change-data-capture
2. **Contract Validation**: dbt models enforce schema agreements
3. **Quality Assurance**: Automated tests (null rates, distribution drift)
4. **Evidence Capture**: Manifest artifacts stored in OPS

#### Governance Framework

1. **Policy Application**: Automated tagging/masking at table creation
2. **Access Control**: Role-based permissions with MFA requirements
3. **Monitoring**: Real-time policy compliance checking
4. **Incident Response**: Escalation workflows for violations

## Key Technical Decisions

### Architecture Decisions

#### Multi-Database Pattern

- **Decision**: One database per domain (`BROOK_COMMERCE`) vs. single database with schemas
- **Rationale**: Domain autonomy with platform-level governance controls
- **Trade-offs**: Management complexity vs. security isolation
- **Consequence**: Domains can move across accounts if needed

#### Tier Naming Convention

- **Decision**: BRONZE/SILVER/PLATINUM vs. RAW/CURATED/SERVED or similar
- **Rationale**: Industry-standard terminology for data lakehouses
- **Implication**: Easier hiring and cross-platform knowledge sharing

#### Policy-as-Code Approach

- **Decision**: Declarative SQL policies in version control
- **Rationale**: Reviewable, testable, version-controlled security
- **Implementation**: PR-gated policy changes with automated application

### Design Patterns in Use

#### Collector Pattern

A collector is a reusable, containerized microservice for data ingestion:

```yaml
# Collector Definition
name: orders_events_v1
source: kafka://orders.v1
schema_format: avro
dlq: kafka://orders.dlq
transformations:
  - dedupe(keys: [order_id, event_ts])
  - pii_mask(fields: [customer_email])
sinks:
  - table: BROOK_COMMERCE.BRONZE.ORDERS_RAW
```

**Key Characteristics**:

- Schema-validated ingestion
- Idempotency guarantees via dedupe keys
- PII detection and optional masking
- DLQ handling for failed messages

#### Contract Pattern

Contracts define data product guarantees between producers and consumers:

```yaml
# Product Contract
name: orders_core
schemas:
  platinum:
    - BROOK_COMMERCE.PLATINUM.ORDERS
slo:
  freshness_p95: "<=10m"
  completeness: "null_rate(total_usd) <= 0.1%"
policies:
  required: [masking, row_access]
```

**Responsibilities**:

- Producer commits to SLOs and schema stability
- Platform enforces contract via tests and monitoring
- Breaking changes require approval workflow

#### Policy Template Pattern

Reusable policy templates with parameterization:

```sql
-- Masking Template
{% macro mask_email(column_name, allowed_roles) -%}
  CASE
    WHEN CURRENT_ROLE() IN {{ allowed_roles | to_sql_list }}
    THEN {{ column_name }}
    ELSE REGEXP_REPLACE({{ column_name }}, '.+(@.*)', '#****\\1')
  END
{% endmacro %}
```

#### Compliance Macro Pattern

Macros that enforce compliance requirements:

```sql
-- Compliant Table Creation
{% macro create_compliant_table(table_name, classification, policies) -%}
  CREATE TABLE {{ table_name }} (...);
  ALTER TABLE {{ table_name }} SET TAG classification = '{{ classification }}';
  {% for policy in policies %}
    ALTER TABLE {{ table_name }} ADD {{ policy.type }} POLICY {{ policy.name }};
  {% endfor %}
{% endmacro %}
```

### Components

#### Upstream Systems

- OLTP Applications: Event publishing via outbox pattern
- Change Data Capture: Debezium for database events
- Streaming Platforms: Kafka/Kinesis for event aggregation
- S3/KMS: Encrypted bulk data ingestion

#### Downstream Consumers

- Analytics Tools: Tableau/Looker connecting via Secure Shares
- Machine Learning: Feature access for model training
- Operational Systems: Configurable sharing for downstream apps
- External Partners: Reader accounts with masked data

#### Cross-Domain Dependencies

- Shared Policies: Global network/masking templates
- Platform Tools: Common collectors, monitoring dashboards
- Governance Interfaces: Unified access request workflows

### Critical Paths for Implementation

The system uses several interconnected processing paths that must be implemented in specific order:

#### 1. Foundation Setup (Week 1)

- Domain database creation with RBAC hierarchy
- Network policy and warehouse configuration
- Global tag/masking policy templates

#### 2. Data Ingestion (Week 2-3)

- Collector implementation and deployment
- BRONZE schema design and landing patterns
- Stream creation for incremental processing

#### 3. Transformation Layer (Week 4-5)

- Task/Dynamic Table definitions for SILVER
- dbt model structure with contract enforcement
- PLATINUM dataset specifications

#### 4. Governance Layer (Ongoing)

- Automated policy application
- SLO monitoring and alerting framework
- Evidence collection and certification workflows

Each path has critical success factors and rollback procedures documented in runbooks.
