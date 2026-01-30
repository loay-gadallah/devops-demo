# Enterprise DevSecOps Demo Prompt
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

---

## 4) Applications

### Frontend
- React banking portal
- Pages: Account, Dashboard, Transfer
- Unit tests: Jest + React Testing Library

### Backend
- Java Spring Boot
- API layer + Core layer
- Unit tests: JUnit 5 + Mockito

---

## 5) Unit Test Stage (Before Build)

### Frontend
- Jest / RTL
- JUnit XML + coverage
- Fail pipeline on failure

### Backend
- JUnit 5 + Mockito
- JaCoCo coverage
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

- FE: npm build + Docker image
- BE: Maven/Gradle package + Docker image
- Tag images with Git commit SHA

---

## 9) Test Stage (After Build)

- Deploy to `apps-staging`
- UI tests: Cypress / Playwright
- API tests: Newman / RestAssured
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
- Kubernetes deployment via kubectl or Helm

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

- platform (Jenkins, Jira, Postgres, SonarQube)
- apps-staging
- apps-prod
- tests (optional)

---

## 16) Repository Structure

/infra  
/portal-fe  
/portal-be  
/tests/ui  
/tests/api  
/security  
Jenkinsfile-fe  
Jenkinsfile-be  
README.md  

---

## 17) README MUST INCLUDE

- MicroK8s enable commands
- Deployment commands
- Jira setup steps
- Jenkins setup steps
- Git push commands
- Approval & release flow explanation

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