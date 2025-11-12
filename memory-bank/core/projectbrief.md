# Project Brief: DAS Platform Demo

## Overview

The das-platform-demo project is a comprehensive demonstration of a modern data platform architecture implementing data mesh principles on Snowflake, dbt, and AWS, with compliance-first design for HIPAA/SOC 2 eligibility.

## Core Requirements

- **Data Mesh Implementation**: Domain-owned data products with federated governance
- **Data Microservices**: Collectors for reliable data ingestion from applications/platforms
- **Compliance-First Architecture**: HIPAA/SOC 2 controls designed-in (classification, least-privilege access, masking/row policies, auditability, contract testing, cost/risk guardrails)
- **Technology Stack**: Snowflake database, dbt for transformations, AWS for infrastructure
- **Schema Pattern**: BRONZE (raw), SILVER (cleaned), GOLD (consumer-grade), OPS (observability/compliance) schemas per domain
- **Policy Framework**: Tags, masking policies, row access policies, network policies for governance
- **Collector Architecture**: Schema-validated, PII-aware ingestion pipelines with deduplication and DLQ handling
- **Observability**: SLOs for freshness/completeness, drift detection, lineage tracking, audit evidence capture

## Goals

1. Demonstrate reference architecture for enterprise data platforms
2. Showcase compliance controls in action (PHI/PII security, access controls)
3. Provide working collectors for common data sources (Kafka, S3, Kinesis)
4. Implement policy-as-code patterns for governance
5. Enable evidence-as-code for SOC 2 compliance
6. Measure and monitor platform performance with SLO dashboards

## Scope

- Domain databases: `BROOK_COMMERCE`, `BROOK_HEALTH` (examples)
- Collectors: Orders, Auth events as pilots
- Gold datasets: ORDERS, CUSTOMERS_SCD, SESSIONS
- Policies: Email masking, regional row access, network restrictions
- CI/CD: PR-gated testing with compliance checks
- Monitoring: Freshness, completeness, drift, cost tracking

## Constraints

- Must demonstrate HIPAA-eligible patterns without storing actual PHI in demo
- Snowflake accounts identified as HIPAA eligible with Business Associate Agreement (BAA)
- Network security: PrivateLink, allowlisted IPs, encrypted stages
- Retention policies: 30d bronze, 400d silver, 5y gold (configurable per classification)
