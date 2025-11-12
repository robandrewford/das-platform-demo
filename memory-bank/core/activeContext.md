# Active Context: DAS Platform Demo

## Current Work Focus

Memory bank initialization completed. Project is in planning/reference implementation phase. No active development work in progress - this repository contains architectural documentation and reference patterns for the DAS platform.

## Recent Changes

- **Memory Bank Initialization**: Created core documentation structure (projectbrief.md, productContext.md, techContext.md, systemPatterns.md)
- **Architecture Definition**: Established data mesh patterns with BRONZE/SILVER/GOLD tier structure
- **Compliance Framework**: Documented HIPAA/SOC 2 controls including policy-as-code, evidence collection, and governance patterns
- **Collector Patterns**: Defined microservice architecture for data ingestion with schema validation and PII handling

## Next Steps & Prioritized Tasks

### Immediate (Next 7 days)

- **Initialize Target Infrastructure**: Set up development Snowflake account with HIPAA-enabled configuration
- **Baseline dbt Project**: Create initial dbt structure with profiles for BROOK_COMMERCE domain
- **Implement Pilot Collector**: Build orders_events_v1 collector using Kafka connector pattern

### Short-term (Next 30 days - 30/60/90 roadmap)

- **BRONZE Layer**: Orders/auth data ingestion pipelines with Snowflake Kafka Connector
- **SILVER Transformations**: Stream/Task processing for deduplication and enrichment
- **GOLD Datasets**: Contract-compliant ORDER/CUSTOMER/SESSION tables with contracts
- **Policy Implementation**: Email masking and regional row access policies
- **SLO Monitoring**: Basic freshness/completeness dashboards in OPS schema

### Medium-term (90+ days)

- **Multi-Domain Expansion**: Scale patterns to BROOK_HEALTH and additional domains
- **Advanced Governance**: Automated policy coverage analysis and compliance reporting
- **Evidence Automation**: CI/CD integration with artifact capture and certification workflows
- **Cost Optimization**: Resource Monitor alerting and credit allocation by domain

## Important Patterns & Preferences

### Naming Conventions

- **Domain Databases**: `BROOK_<DOMAIN>` (e.g., `BROOK_COMMERCE`, `BROOK_HEALTH`)
- **Tables**: PascalCase for entity names, snake_case for columns
- **Roles**: `<DOMAIN>_<TIER>_<ENV>` (e.g., `COMMERCE_GOLD_PROD`)
- **Policies**: Descriptive names with version suffixes (e.g., `MASK_EMAIL_V1`)

### Preferred Practices

- **Policy-as-Code**: All security controls version-controlled and PR-gated
- **Contract-First**: SLOs and schemas defined before implementation
- **Evidence Collection**: Automated capture for all compliance-relevant events
- **Incremental Processing**: Prefer Streams/Tasks over batch approaches where possible
- **Cost Awareness**: Resource tagging and monitoring mandatory for all compute

### Known Preferences

- **Dynamic Tables**: Preferred over traditional Tasks for incremental workloads
- **Snowpipe Streaming**: Preferred over standard Snowpipe for real-time cases
- **Kafka Integration**: Preferred messaging layer for event-driven architectures
- **PrivateLink**: Mandatory for production network connectivity
- **Reader Accounts**: Preferred over full account sharing for external consumers

## Learnings & Project Insights

### Architecture Insights

- **Domain Boundaries**: Clear separation enables autonomy but requires careful governance design
- **Policy Complexity**: Masking/row access patterns need domain-specific customization
- **SLO Trade-offs**: Contract enforcement improves trust but increases development overhead
- **Evidence Overhead**: Comprehensive artifact capture necessary but storage/cost impact significant

### Implementation Insights

- **Snowflake Features**: Dynamic Tables promising but ecosystem maturity still developing
- **dbt Contracts**: Effective for schema stability but testing overhead needs optimization
- **Collector Complexity**: PII detection and schema validation add reliability at cost of throughput
- **CI/CD Integration**: Compliance checks add PR friction; automation critical for developer experience

### Compliance Insights

- **PHI Patterns**: Email/customer IDs often pseudonymous, requiring different masking strategies
- **Access Complexity**: Multi-tier role hierarchies essential for least-privilege enforcement
- **Network Security**: PrivateLink + policies provide defense-in-depth but increase setup complexity
- **Evidence Requirements**: Real-time collection challenging; scheduled snapshots may suffice for many controls

## Active Decisions & Considerations

### Open Questions

- **Collector Framework**: Build custom collector runtime vs. configure Snowflake Kafka Connector?
- **Policy Granularity**: Column-level vs. table-level policies for access control?
- **SLO Measurement**: Real-time streams vs. scheduled aggregations for monitoring?
- **Cost Attribution**: Tag-based allocation vs. warehouse-level tracking?

### Current Preferences (Subject to Change)

- Custom collector framework for maximum control and PII handling flexibility
- Column-level policies for fine-grained control (with automation overhead accepted)
- Stream-based real-time SLOs for critical business metrics
- Tag-based cost attribution with warehouse-level fallbacks

### Technology Evaluations Ongoing

- **Dynamic Tables**: Assessing Beta feature stability for production workloads
- **Snowpark Python**: Evaluating complexity vs. SQL approaches for transformations
- **Alternative Connectors**: Comparing Kafka, Kinesis, and direct API ingestion patterns

## Current Environment Context

- **Repository State**: Documentation/reference patterns only, no executable code yet
- **Infrastructure**: Concept-level design; requires Snowflake account setup for implementation
- **Team Context**: Solo development/demo; patterns designed for enterprise adoption
- **Compliance Context**: Framework designed for HIPAA/SOC 2 but not yet implemented with real controls

## Notes for Next Development Session

- Start with order_events_v1 collector using Snowflake Kafka Connector (assumes topic exists)
- Create dbt project structure following documented patterns
- Implement masking macros before table creation
- Prioritize working data flow: BRONZE → SILVER → GOLD for single domain
- Establish OPS tables for SLO tracking early to inform dashboard decisions

## Dependencies and Blockers

- **Snowflake Account**: HIPAA-enabled account required for full compliance demonstration
- **Kafka Infrastructure**: Test topics needed for collector development
- **Domain Data Samples**: Anonymized order/auth data for development testing
- **CI/CD Pipeline**: GitHub Actions setup for automated testing and deployment
