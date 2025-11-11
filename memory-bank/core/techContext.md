# Tech Context: DAS Platform Demo

## Technologies Used

### Core Infrastructure

- **Snowflake**: Primary data warehouse platform
  - Enterprise edition with HIPAA/SOC 2 compliance features
  - ACCOUNT_USAGE/ORGANIZATION_USAGE views for observability
  - ACCESS_HISTORY/LOGIN_HISTORY/QUERY_HISTORY for audit evidence
  - Dynamic Tables for incremental transformations
  - Snowpipe Streaming for real-time ingestion
  - Secure Data Sharing for consumer-grade distributions

- **AWS**: Cloud infrastructure provider
  - S3: Encrypted stages for data landing (SSE-KMS)
  - Kinesis/Firehose: Streaming data sources
  - PrivateLink: Secure connectivity to Snowflake
  - IAM: Service account management
  - Cost monitoring via Cost Explorer

- **Kafka**: Event streaming platform
  - Debezium CDC: PostgreSQL/MySQL outbox pattern
  - Snowflake Kafka Connector: Direct integration
  - Schema Registry: Avro/Protobuf validation

### Data Engineering Tools

- **dbt (Data Build Tool)**: Transformation framework
  - Contract enforcement for schemas
  - Meta tags for classification/freshness SLOs
  - Test automation for quality gates
  - Manifest.json artifacts for evidence capture
  - Lineage visualization
  - Custom macros for de-identification

- **Python**: Application development
  - Snowpark API for complex transformations
  - Pandas/Polars for data processing
  - Pydantic for schema validation
  - FastAPI for HTTP collectors (if needed)

- **SQL**: Core transformation/query language
  - Snowflake dialect extensions
  - CTEs/streams for incremental processing
  - Information schema queries for metadata

### Development & CI/CD

- **Git**: Version control for dbt models, collector configs, policies
- **GitHub Actions/Azure DevOps**: CI/CD pipelines
  - dbt test execution
  - Schema diff/contract validation
  - PHI/PII tagging verification
  - Policy coverage checks
  - Artifact capture for evidence store

- **Docker**: Containerization for collectors and tools
- **Terraform**: Infrastructure-as-code for Snowflake resources (alternate to schema change)

### Compliance & Security Tools

- **Custom Scripts**: Policy-as-code enforcement
  - Automated tagging/masking application
  - Network/policy validation
  - Access review automation

- **Monitoring Stack**:
  - Snowflake Resource Monitors for cost control
  - Custom SLO dashboards (preset: Tableau/Looker; optional: Grafana/Prometheus)
  - Alerting via PagerDuty/ServiceNow

### Dependencies

#### Runtime Dependencies

- Snowflake Python Connector: For dbt and custom jobs
- dbt-snowflake adapter: Transformation execution
- Convergent Evolution: Dynamic Table beta features (if enabled)
- Snowflake Kafka Connector: Event ingestion

#### Development Dependencies  

- sqlfluff: SQL linting
- pytest: Test framework for dbt models
- pre-commit: Quality gates (linting, testing)
- docker-compose: Local development environment

#### Python Package Ecosystem (requirements.txt)

```m
snowflake-connector-python>=3.0.0
dbt-core>=1.8.0
dbt-snowflake>=1.8.0
pandas>=2.0.0
pydantic>=2.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
```

## Development Setup

### Local Environment

- Python 3.11+ environment (recommended: conda/venv)
- dbt profile configured for development Snowflake account
- No PHI in dev/test environments (compile-time macro enforcement)
- Local dbt documentation server for schema exploration

### Branch Strategy

- main: Production configuration
- develop: Integration testing
- feature/*: Domain-specific developments
- compliance/*: Policy and control updates

### Workflow

1. Feature branches with tests and documentation
2. PR templates requiring compliance sign-off
3. Auto CI: lint, test, diff, compliance checks
4. Manual approval for breaking changes or PHI exposure
5. Auto-deployment to dev → stage → prod

## Constraints

### Product Constraints

- HIPAA/SOC 2 eligibility requires Snowflake BAA and account configuration
- PHI/PII classification must use enterprise tagging framework
- Network policy must enforce PrivateLink/allowlisted connections
- Evidence artifacts must be immutable and version-controlled

### Technical Constraints

- Adaptation time for existing enterprise Snowflake accounts (2-4 weeks)
- Latency budget: Bronze ingestion target <5min P95
- Resource isolation: Warehouses/roles scoped to domain + environment
- Cost targets: <$2K/month initial setup, sub-$10K/month per domain running

### Data Constraints

- Time Travel retention: Configurable by classification (30d bronze, 400d silver, 5y platinum)
- Storage encryption: AES-256 for all stages and tables
- Compression: Snowflake automatic optimization
- Backup/recovery: Enterprise continuous data protection within region

## Tool Usage Patterns

- **dbt Run/Test**: Daily execution for all domains
- **Schema Changes**: dbt contract macros with versioned migrations  
- **Policy Updates**: Idempotent ALTER statements via CI
- **Collector Deployments**: Container-based with config maps
- **Evidence Collection**: Scheduled queries to ACCESS_HISTORY, dbt artifacts
- **Cost Optimization**: Resource Monitors with alerts; credit allocation by tags
- **Security Scanning**: Regexp patterns for PHI detection before landing
- **Monitoring**: Real-time SLO calculations via Streams/Tasks
