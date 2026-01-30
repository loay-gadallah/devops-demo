# Enterprise DevSecOps Demo Prompt - v1.1
## MicroK8s on macOS – CI/CD + Jira + Jenkins + Quality + Security + Approval

You are a **Senior DevOps/SRE and Full-Stack Engineer**.

Your task is to design and implement a **complete Enterprise-grade DevSecOps demo environment**
on **macOS using MicroK8s** (NOT Minikube).

This demo must showcase:
- CI/CD
- Quality gates
- Security gates
- Manual governance & release approval
- Jira-driven automation
- Kubernetes-native execution

---

## 1) End-to-End Flow (MANDATORY)

Code
→ CI (Jenkins)
→ Unit Test
→ Code Quality
→ Security Check (SAST)
→ Build
→ Integration/UI/API Tests
→ Release Approval (Jira)
→ Penetration Test (DAST)
→ Deploy

---

## 2) Core Platform Components

### Jira + PostgreSQL
- Jira Software deployed on Kubernetes
- PostgreSQL as external DB
- Persistent Volumes
- Ingress or NodePort access
- **30-day Trial License applied manually via UI**
- Jira MUST be fully usable

### Jenkins
- Jenkins deployed on Kubernetes
- Declarative Pipelines ONLY
- Kubernetes agents
- GitHub webhook integration
- Jira REST API integration

### Portal PostgreSQL (NEW in v1.1)
- Dedicated PostgreSQL 15 instance for the banking portal backend
- Separate from Jira's PostgreSQL
- Schema managed by JPA/Hibernate (ddl-auto: update)
- Credentials stored as K8s secret (`portal-postgres-secret`)

---

## 3) Jenkins Pipelines (Declarative ONLY)

Two pipelines:
- `portal-fe-main`
- `portal-be-main`

### Mandatory Stages (Exact Order)

1. Clone
2. Unit Test
3. Code Quality
4. Security Check (SAST)
5. Build
6. Test (Integration / UI / API)
7. Release Approval (Jira-driven)
8. Penetration Test
9. Deploy

Fail-fast rules apply to all stages before Deploy.

### GitHub Webhook Trigger (NEW in v1.1)
- Jenkins jobs configured with GitHub push trigger
- Any push to `main` branch auto-triggers the pipeline

---

## 4) Applications (UPDATED in v1.1)

### Frontend (Retail Banking Portal)
- React 18 with modern UI/UX
- **Login Screen** with JWT authentication
- **Dashboard** with account summaries, card count, recent transfers
- **Account Management** - list accounts, account details, transaction history
- **Card Management** - visual card display, block/unblock actions
- **Transfer Management** - Local Transfer / International Transfer / Between My Accounts
- Pure CSS styling with CSS custom properties (no UI framework)
- Color palette: Deep navy (#0f2042) + teal accent (#00b4d8)
- Responsive sidebar navigation with react-icons
- Unit tests: Jest + React Testing Library

### Backend (Spring Boot + Spring Security + JPA)
- Java 17, Spring Boot 3.2.5
- **User Management** - JWT login, admin user CRUD
- **Account Management** - CRUD, transaction history
- **Card Management** - CRUD, block/unblock
- **Transfer Management** - Local, International, Internal transfers
- **Dashboard API** - Aggregated summary endpoint
- PostgreSQL database with JPA/Hibernate
- Spring Security with JWT (stateless)
- BCrypt password encoding
- Data seeder for demo accounts
- Unit tests: JUnit 5 + Mockito + H2 (test profile)

### Database Schema
| Table | Description |
|-------|-------------|
| users | id, username, password, fullName, email, role, enabled |
| accounts | id, accountNumber, accountName, type, currency, balance, status, user_id |
| cards | id, cardNumber, cardHolderName, type, expiryDate, status, dailyLimit, account_id, user_id |
| transfers | id, fromAccount_id, toAccountNumber, beneficiaryName, amount, currency, type, status, reference |
| transactions | id, account_id, type, amount, balanceAfter, description, reference |

### Demo Credentials
- Admin: `admin` / `admin123`
- User: `demo` / `demo123`

---

## 5) Unit Test Stage (Before Build)

### Frontend
- Jest / RTL
- JUnit XML + coverage
- Fail pipeline on failure

### Backend
- JUnit 5 + Mockito
- JaCoCo coverage
- H2 in-memory DB for tests
- Fail pipeline on failure

---

## 6) Code Quality Stage (Before Build)

### Tool
- **SonarQube Community Edition**

### Rules
- Enforce Quality Gate
- Fail pipeline if gate fails

---

## 7) Security Check – SAST (Before Build)

### Tools
- Semgrep
- OWASP Dependency-Check
- SpotBugs (Java)

### Gating
- High / Critical → FAIL pipeline + Jira issue
- Medium / Low → report only

---

## 8) Build Stage

- FE: npm build + Docker image (node:18-alpine → nginx:alpine)
- BE: Maven package + Docker image (maven:3.9 → eclipse-temurin:17-jre)
- Tag images with Git commit SHA
- Import images to MicroK8s via `docker save | multipass transfer | microk8s ctr`

---

## 9) Test Stage (After Build)

- Deploy to `apps-staging`
- UI tests: Cypress
- API tests: Newman
- Fail pipeline on any failure

---

## 10) Release Approval Stage (MANDATORY)

### Approval Source
- Jira Issue (DEVOPS-xxx)

### Mechanism
- Jenkins polls Jira REST API
- Waits for:
  - Status = Approved
  OR
  - Label = approved

### Timeout
- 60 minutes
- Timeout → FAIL pipeline + Jira comment

---

## 11) Penetration Test Stage (Before Deploy)

### Tool
- OWASP ZAP (baseline or API scan)

### Target
- apps-staging URL

### Gating
- High / Critical → FAIL + Jira Security issue

---

## 12) Deploy Stage

- Promote SAME image to `apps-prod`
- No rebuilds allowed
- Kubernetes deployment via kubectl

---

## 13) Jira Automation Rules (MANDATORY)

### Rule A: Trigger Jenkins from Jira
- Manual button or transition
- Sends Webhook to Jenkins
- Passes ISSUE_KEY parameter

### Rule B: Release Approval
- Transition to Approved
- Jenkins detects approval via REST polling

---

## 14) Jira Setup Checklist (Manual)

- Project key: DEVOPS
- Issue types: Bug, Task, Security
- Workflow includes Approved status
- API token generated
- Credentials stored as K8s secrets

---

## 15) Kubernetes Namespaces

- platform (Jenkins, Jira, Postgres, SonarQube, Portal-Postgres)
- apps-staging
- apps-prod
- tests (optional)

---

## 16) Repository Structure

```
/infra
  /bootstrap/01-namespaces.yaml
  /bootstrap/02-secrets-template/
  /platform/jenkins/
  /platform/postgres/
  /platform/postgres-portal/     (NEW)
  /platform/sonarqube/
  /platform/jira/
  /apps/staging/
  /apps/prod/
/portal-fe                        (React + Modern UI)
/portal-be                        (Spring Boot + JPA + Security)
/tests/ui
/tests/api
/security
Jenkinsfile-fe
Jenkinsfile-be
README.md
```

---

## 17) README MUST INCLUDE

- MicroK8s enable commands
- Deployment commands
- Jira setup steps
- Jenkins setup steps
- Git push commands
- Approval & release flow explanation
- **Demo login credentials** (NEW)
- **Application feature overview** (NEW)

---

## 18) Acceptance Criteria

Demo is successful if:
1. Jira button triggers Jenkins
2. Pipelines are Declarative
3. Gates enforced before build
4. Approval blocks deploy
5. PenTest runs before deploy
6. Jira reflects all results
7. Environment can be rebuilt from README
8. **Login works with demo credentials** (NEW)
9. **Dashboard shows account/card/transfer summaries** (NEW)
10. **Transfers can be created (Local/International/Internal)** (NEW)
11. **Cards can be blocked/unblocked** (NEW)
12. **GitHub push triggers Jenkins pipeline** (NEW)
