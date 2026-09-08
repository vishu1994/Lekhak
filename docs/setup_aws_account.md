# AWS Free Tier Account & Cost-Safe Deployment Plan

> **Goal:** Set up an AWS account for our portfolio project while minimizing the risk of unexpected AWS charges.
>
> **Project:** Multi-container ML application currently running with Docker Compose.
>
> **Approach:** Start with a cost-conscious architecture and introduce AWS services incrementally.

---

# 1. Overall Plan

We will proceed in the following phases:

```text
PHASE 1
Create AWS Free Account
        ↓
PHASE 2
Verify Free Plan + Credits
        ↓
PHASE 3
Configure Free Tier Alerts
        ↓
PHASE 4
Configure AWS Budgets
        ↓
PHASE 5
Configure Billing Monitoring
        ↓
PHASE 6
Establish AWS Safety Rules
        ↓
PHASE 7
Create AWS Resource Inventory
        ↓
PHASE 8
Deploy Infrastructure
```

**Important:** Do not create EC2, ECR, RDS, ALB, etc. until the account's billing protections have been configured.

---

# 2. Phase 1 — Create AWS Account

## Objective

Create a new AWS account using the **Free account plan**.

AWS currently offers a Free account plan for new customers.

The Free account plan provides:

* $100 initial AWS credits
* Potentially another $100 through qualifying activities
* Maximum duration of 6 months or until credits are exhausted
* No charges while remaining on the Free account plan

## Steps

1. Go to the official AWS Free Tier page.
2. Create a new AWS account.
3. Complete email, identity and payment verification as required by AWS.
4. When asked to select an account plan, choose:

```text
Free account plan
```

5. Complete account creation.

## Important Rule

Do **not** upgrade to the Paid account plan unless we have deliberately decided to do so.

If AWS asks:

> "Upgrade to Paid plan?"

Stop and evaluate the requirement first.

---

# 3. Phase 2 — Verify Account Plan and Credits

After entering the AWS Console:

```text
AWS Console
    ↓
Billing and Cost Management
```

Verify:

### 3.1 Account Plan

Confirm that the account is using:

```text
Free account plan
```

### 3.2 Credit Balance

Check the available AWS credits.

Expected initial credit:

```text
$100
```

The exact amount displayed may vary depending on the account and current AWS offer.

### 3.3 Expiration

Record the Free account plan expiration date.

The current Free account plan can last for:

```text
Maximum = 6 months
OR
Credits exhausted
```

whichever happens first.

## Action

Create a calendar reminder approximately:

```text
30 days before Free Plan expiration
```

---

# 4. Phase 3 — Configure Free Tier Usage Alerts

## Objective

Receive an email when AWS usage approaches Free Tier limits.

Navigate to:

```text
Billing and Cost Management
        ↓
Billing Preferences
```

Enable:

```text
AWS Free Tier usage alerts
```

Make sure the correct email address is configured.

Conceptually:

```text
AWS Usage
    ↓
Approaching Free Tier limit
    ↓
Email Alert
```

This is our first safety mechanism.

---

# 5. Phase 4 — Configure AWS Budgets

AWS Budgets will provide another layer of protection.

Navigate to:

```text
Billing and Cost Management
        ↓
Budgets
```

## 5.1 Create Zero-Spend Budget

Create a:

```text
Zero spend budget
```

Purpose:

> Notify us if AWS detects chargeable usage.

Conceptually:

```text
Chargeable Usage
      ↓
Zero-Spend Budget
      ↓
Email Alert
```

This should be our primary budget for the initial Free account.

---

## 5.2 Optional Monthly Budget

We can additionally create a small monthly budget for monitoring.

Example:

```text
Budget:
$5/month
```

Alerts:

```text
50%  → $2.50
80%  → $4.00
100% → $5.00
```

We can also enable forecasted-spend notifications.

### Important

A budget is an **alerting mechanism**, not an absolute spending firewall.

Billing data can be delayed.

Therefore:

```text
Budget ≠ Guaranteed maximum bill
```

---

# 6. Phase 5 — Configure Billing Monitoring

We want multiple independent safety mechanisms.

Our monitoring stack should be:

```text
                    AWS Usage
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
     Free Tier       AWS Budget    CloudWatch
       Alerts          Alerts     Billing Alerts
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                     EMAIL
```

## 6.1 Free Tier Alerts

Already configured in Phase 3.

Purpose:

```text
Monitor Free Tier usage
```

---

## 6.2 AWS Budget Alerts

Already configured in Phase 4.

Purpose:

```text
Detect unexpected spending
```

---

## 6.3 CloudWatch Billing Alerts

Configure a CloudWatch billing alarm.

Purpose:

```text
Monitor AWS billing metrics
        ↓
Trigger alarm
        ↓
Email notification
```

We want multiple independent ways of discovering unexpected usage.

---

# 7. Phase 6 — AWS Cost Safety Rules

These rules apply throughout the project.

## Rule 1 — Use One AWS Region

Choose a single region for the project.

Example:

```text
us-east-1
```

Do not randomly create resources across:

```text
us-east-1
us-west-1
ap-south-1
eu-west-1
...
```

unless there is a deliberate reason.

---

## Rule 2 — Understand the Cost Before Creating a Service

Before creating any AWS service, answer:

1. Is it available under the Free account plan?
2. Does it consume credits?
3. What happens if we leave it running?
4. Does it have associated resources that can incur charges?
5. How do we delete it completely?

No service should be created just because a tutorial says:

> "Create this resource."

---

## Rule 3 — Avoid Expensive/Unnecessary Services Initially

For the first deployment, avoid:

```text
EKS
NAT Gateway
Application Load Balancer
ElastiCache
OpenSearch
Multiple EC2 instances
RDS
EFS
```

unless we have explicitly evaluated their cost and necessity.

---

## Rule 4 — No ALB Initially

For our portfolio deployment, we will initially use:

```text
Internet
    ↓
EC2
    ↓
Nginx
    ↓
Multiple FastAPI containers
```

Nginx will act as:

* Reverse proxy
* Load balancer

Example:

```text
                    Nginx
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       FastAPI      FastAPI     FastAPI
          #1           #2          #3
```

This gives us horizontal scaling without introducing an AWS Application Load Balancer initially.

---

## Rule 5 — Avoid NAT Gateway Initially

Do not create a NAT Gateway simply because a production AWS tutorial recommends one.

NAT Gateway can generate costs and isn't necessary for our first architecture.

---

## Rule 6 — Be Careful With Stopped EC2 Instances

Stopping an EC2 instance does not necessarily mean all associated costs become zero.

For example:

```text
EC2
 │
 ├── Compute
 │
 └── EBS Storage
```

Stopping EC2 may stop compute charges, while attached storage can continue to incur charges.

Always review associated resources.

---

## Rule 7 — Clean Up Experimental Resources

Whenever we finish an experiment:

```text
EC2
EBS
Elastic IP
Snapshots
ECR images
S3 objects
Security groups
Other resources
```

Review whether the resource is still required.

Delete unnecessary resources.

---

# 8. Phase 7 — Maintain an AWS Resource Inventory

Before creating infrastructure, maintain a simple inventory.

| Resource    | Purpose                 | Region      | Cost Risk | Keep?        |
| ----------- | ----------------------- | ----------- | --------- | ------------ |
| EC2         | Run application         | `us-east-1` | Medium    | Yes          |
| ECR         | Store Docker images     | `us-east-1` | Low       | Yes          |
| EBS         | EC2 storage             | `us-east-1` | Low       | Yes          |
| S3          | ML artifacts            | `us-east-1` | TBD       | Later        |
| ALB         | Load balancing          | —           | Paid      | No initially |
| NAT Gateway | Private subnet internet | —           | Paid      | No           |
| RDS         | PostgreSQL              | —           | TBD       | Later        |

Update this table whenever we add a new AWS service.

---

# 9. Phase 8 — Initial AWS Architecture

For the first deployment, keep the architecture simple.

```text
                         Internet
                            │
                            ▼
                         EC2
                            │
                          Nginx
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
            Frontend       API        Worker
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
             PostgreSQL  RabbitMQ     MinIO
                                      │
                                      ▼
                                    MLflow
```

All containers will initially run on the same EC2 instance using Docker Compose.

---

# 10. Application-to-AWS Mapping

Our current Docker Compose services:

| Docker Compose     | Initial AWS Deployment            |
| ------------------ | --------------------------------- |
| `frontend`         | Docker container on EC2           |
| `api`              | Docker container on EC2           |
| `eval-worker`      | Docker container on EC2           |
| `postgres`         | Docker container on EC2           |
| `rabbitmq`         | Docker container on EC2           |
| `minio`            | Docker container on EC2           |
| `mlflow`           | Docker container on EC2           |
| `create-mlflow-db` | Docker Compose initialization job |
| `minio-init`       | Docker Compose initialization job |
| Nginx              | Docker container on EC2           |

---

# 11. CI/CD Architecture

We have already built most of the CI portion using GitHub Actions.

The target architecture is:

```text
Developer
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Lint
    ├── Unit Tests
    ├── Docker Build
    │
    ▼
Amazon ECR
    │
    ▼
EC2
    │
    ▼
Docker Compose
```

Eventually:

```text
GitHub
   │
   ▼
GitHub Actions
   │
   ├── Test
   ├── Build
   ├── Push
   │
   ▼
ECR
   │
   ▼
EC2 Deployment
   │
   ▼
docker compose pull
   │
   ▼
docker compose up -d
```

---

# 12. Future Production-Like Architecture

Once the basic deployment works, we can progressively improve the architecture.

## Phase 2

Move PostgreSQL to:

```text
Amazon RDS
```

Move MinIO/object storage to:

```text
Amazon S3
```

Architecture:

```text
                    EC2
                     │
             Docker Compose
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Frontend       API         Worker
                     │
              ┌──────┴──────┐
              ▼             ▼
             RDS            S3
          PostgreSQL     Artifacts
```

---

# 13. Optional Production Architecture

If we eventually want to demonstrate a more production-oriented AWS architecture:

```text
                         Internet
                            │
                            ▼
                           ALB
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                Frontend           API
                                    │
                         ┌──────────┼──────────┐
                         ▼          ▼          ▼
                        RDS      RabbitMQ      S3
                                    │
                                    ▼
                                 Worker
```

Possible future services:

```text
ALB
ECS / EKS
RDS
S3
CloudFront
Route 53
```

However, this architecture is **not our initial target** because our priority is keeping the portfolio deployment cost-conscious.

---

# 14. Final Cost-Safety Checklist

Before creating AWS infrastructure:

* [ ] AWS Free account plan confirmed
* [ ] AWS credits verified
* [ ] Free plan expiration recorded
* [ ] Free Tier usage alerts enabled
* [ ] Zero-spend budget created
* [ ] Optional monthly budget created
* [ ] Billing alerts configured
* [ ] Correct email address verified
* [ ] One AWS region selected
* [ ] AWS resource inventory created
* [ ] No unnecessary services planned
* [ ] No NAT Gateway
* [ ] No ALB initially
* [ ] No EKS initially
* [ ] No multiple EC2 instances initially
* [ ] Cost implications understood before creating each resource

---

# 15. Golden Rule

The most important rule for this project:

> **Never create an AWS resource without first understanding how it can affect the bill.**

Our approach is:

```text
Understand
    ↓
Check pricing / Free Plan eligibility
    ↓
Create
    ↓
Monitor
    ↓
Clean up
```

Not:

```text
Create everything
    ↓
Hope Free Tier covers it
```

---

# 16. Our Immediate Next Steps

We will now proceed interactively.

### Step 1

Create the AWS account and select:

```text
Free account plan
```

### Step 2

Verify:

```text
Account Plan
Credits
Expiration
```

### Step 3

Configure:

```text
Free Tier Alerts
```

### Step 4

Configure:

```text
Zero-Spend Budget
```

### Step 5

Configure:

```text
Billing Alerts
```

### Step 6

Verify the account is ready before creating any AWS infrastructure.

Only after all six steps are complete will we move to:

```text
ECR
  ↓
EC2
  ↓
Docker
  ↓
Nginx
  ↓
Docker Compose
  ↓
Public Portfolio Application
```
