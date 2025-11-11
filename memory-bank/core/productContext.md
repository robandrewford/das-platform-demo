# Product Context: DAS Platform Demo

## Why This Project Exists

This demo addresses critical challenges in modern enterprise data platforms:

### Problems Solved

- **Governance at Scale**: Traditional monolithic data warehouses lack federated ownership and computational governance, leading to security risks, compliance gaps, and poor data quality.
- **Compliance Complexity**: HIPAA/SOC 2 requirements often bolted-on late, creating fragile environments with encryption/network gaps and manual evidence collection.
- **Data Mesh Adoption**: Organizations struggle to implement domain-ownership models due to lack of clear patterns for collectors, policies, and cross-domain governance.
- **Cost & Risk Management**: Without built-in guardrails, data platforms balloon in cost and exposure while failing to demonstrate compliant operations.
- **Time-to-Value**: Without reusable patterns, each new domain requires custom engineering for ingestion, transformation, and security.

### Opportunity

The DAS (Data-as-a-Service) Platform Demo bridges this gap by providing:

- **Reference Architecture**: Proven patterns for HIPAA/SOC 2-ready data mesh on Snowflake + dbt + AWS
- **Working Code**: Deployable collectors, models, and policies demonstrating compliance-first design
- **Evidence Framework**: Automated capture of SOC 2 evidence from artifacts and usage history

## How It Should Work

### Core Workflow

1. **Domain Teams Own Data Products**: Each domain (e.g., commerce, health) owns their database (`BROOK_<DOMAIN>`) with full autonomy over schemas and policies.

2. **Collectors Handle Ingestion**: Event-driven microservices pull from Kafka/S3/Kinesis, validate schemas, detect PII, and land data in `BRONZE` tier with idempotency.

3. **Automated Transformations**: Streams/Tasks/Dynamic Tables promote data through `SILVER` (clean) and `PLATINUM` (consumer-grade) tiers with contract-enforced quality.

4. **Policy-as-Code Governance**: Tags classify data, masking/row policies enforce least-privilege access, network policies control connectivity.

5. **Evidence-as-Code Compliance**: Every change captured as immutable artifacts (dbt manifests, policy diffs, access logs) enabling continuous SOC 2 certification.

### Key Mechanisms

- **Contracts over Interfaces**: Domain teams provide guaranteed SLOs (freshness, completeness) and publish consumer-grade datasets via Secure Shares.
- **Federated Governance**: Platform team sets global policies (classification framework, network boundaries) while domains manage their own access roles.
- **Compliance by Design**: Policies applied at table level automatically; developers use compliant macros without security expertise.
- **Operational Transparency**: SLO dashboards show health; cost showback per domain; automated alerts on policy violations or data drift.

### User Experience Goals

#### For Domain Data Teams

- **Self-Service Platform**: Drop-in collectors for common sources; instant compliance via templates; CI/CD with automatic governance checks.
- **Clear Ownership**: Full control over data model evolution with contract protection; ability to deprecate safely.
- **Risk-Appropriate Controls**: Simple URI templates for masking; role-based row access; automatic evidence collection.

#### For Platform Engineers

- **Pattern Reusability**: Collectible architectures for new domains; policy templates for different classifications.
- **Proactive Governance**: Automated drift detection, deprecated schema warnings, policy coverage analysis.
- **Operational Visibility**: Cross-domain SLO tracking, cost attribution, security incident alerting.

#### For Consumers (Analysts/Scientists)

- **Trusted Data Products**: Guaran teed quality datasets with clear lineage; privacy-preserving interfaces for sensitive data.
- **Minimal Friction Access**: Automatic de-identification where needed; regional/data type filtering.
- **Reliability Guarantees**: SLO dashboards; automatic fallback to cached versions during outages.

#### For Compliance Officers

- **Continuous Evidence**: Real-time alerts on policy violations; searchable audit trails from artifacts.
- **Risk Mitigation**: Configurable retention; automated PHI scans; SOC 2 control walkthroughs.
- **Change Validation**: PR-level compliance checks prevent regressions before deployment.

## Success Criteria

- Deployable in 30 days for pilot domains with full HIPAA/SOC 2 controls.
- Zero policy violations in production usage.
- <10m P95 freshness on critical Platinum datasets.
- Evidence artifacts automatically collected for all compliance events.
- Sub-$10K/month per domain at scale after initial setup.
