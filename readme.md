# Enterprise DevSecOps Demo
## MicroK8s on macOS – CI/CD + Jira + Jenkins + Quality + Security + Approval

This repository demonstrates a **full Enterprise-grade DevSecOps pipeline**
running locally on **macOS using MicroK8s**.

---

## High-Level Flow

Code  
→ Jenkins (CI)  
→ Unit Test  
→ Code Quality (SonarQube)  
→ Security Check (SAST)  
→ Build  
→ Integration / UI / API Tests (Staging)  
→ Release Approval (Jira)  
→ Penetration Test (DAST)  
→ Deploy to Production  

---

## Kubernetes Namespaces

- platform: Jenkins, Jira, PostgreSQL, SonarQube
- apps-staging: temporary environment for testing & pen-test
- apps-prod: final production deployment
- tests: optional standalone jobs

---

## Prerequisites

- macOS
- MicroK8s
- Docker Desktop
- Git
- GitHub account
- Atlassian account (for Jira trial license)

---

## Install MicroK8s

```bash
brew install microk8s
microk8s install
microk8s status --wait-ready
microk8s enable dns storage ingress helm3
```

Verify:
```bash
microk8s kubectl get nodes
```

---

## Bootstrap Namespaces & Secrets

```bash
microk8s kubectl apply -f infra/bootstrap/01-namespaces.yaml
microk8s kubectl apply -f infra/bootstrap/02-secrets-template/
```

⚠️ Do not commit real secrets.

---

## Deploy Platform Components

### PostgreSQL for Jira
```bash
microk8s kubectl apply -f infra/platform/postgres/ -n platform
```

### Jira Software
```bash
microk8s kubectl apply -f infra/platform/jira/ -n platform
```

Access Jira:
```
http://jira.local
```

Add to /etc/hosts if needed:
```
127.0.0.1 jira.local
```

---

### Jenkins
```bash
microk8s kubectl apply -f infra/platform/jenkins/ -n platform
```

Get admin password:
```bash
microk8s kubectl exec -n platform deploy/jenkins -- cat /var/jenkins_home/secrets/initialAdminPassword
```

Access:
```
http://jenkins.local
```

---

### SonarQube (Community + Dedicated DB)

Deploy SonarQube PostgreSQL:
```bash
microk8s kubectl apply -f infra/platform/sonarqube-postgres/ -n platform
```

Deploy SonarQube:
```bash
microk8s kubectl apply -f infra/platform/sonarqube/ -n platform
```

Access:
```
http://sonar.local
```

---

## Jira Initial Setup (Manual)

1. Login using Atlassian account
2. Apply 30-day Jira Software trial license
3. Create project:
   - Key: DEVOPS
4. Add workflow status: Approved
5. Generate Jira API token
6. Store token in Kubernetes secret

---

## Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial DevSecOps demo"
git branch -M main
git remote add origin https://github.com/<your-org>/<repo>.git
git push -u origin main
```

---

## Jenkins Pipelines

Pipelines:
- portal-fe-main
- portal-be-main

Stages:
1. Clone
2. Unit Test
3. Code Quality
4. Security Check (SAST)
5. Build
6. Test (Integration/UI/API)
7. Release Approval (Jira)
8. Penetration Test
9. Deploy

---

## Jira Automation

### Trigger Jenkins
- Manual button
- Send Web Request to Jenkins buildWithParameters endpoint
- Pass ISSUE_KEY and BRANCH

### Release Approval
- Transition issue to Approved
- Jenkins polls Jira REST API

---

## Verify Deployment

```bash
microk8s kubectl get pods -n apps-staging
microk8s kubectl get pods -n apps-prod
```

---

## Cleanup

```bash
microk8s kubectl delete ns platform apps-staging apps-prod tests
```

---

## Author
DevSecOps Demo by Loay