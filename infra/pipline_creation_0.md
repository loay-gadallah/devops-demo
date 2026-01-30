# Pipeline Creation & Execution Guide v0

## Phase 1: Prerequisites (Already Done)

You already have MicroK8s running with namespaces, secrets, and platform components (Jenkins, Jira, SonarQube, PostgreSQL) deployed. Verify everything is healthy:

```bash
microk8s kubectl get pods -n platform
```

All pods should be `Running`. Confirm access:
- Jenkins: `http://jenkins.local` (login: `Gadallahlm` / your password)
- Jira: `http://jira.local`
- SonarQube: `http://sonar.local` (default: `admin`/`admin`)

---

## Phase 2: Push Code to GitHub

Since you already have a repo at `https://github.com/loay-gadallah/devops-demo.git`, push all the new files:

```bash
cd /Users/loay.gadallah/Project_Sources/DevOps_Demo
git add portal-fe/ portal-be/ Jenkinsfile-fe Jenkinsfile-be security/ tests/ infra/apps/
git commit -m "Add applications, pipelines, security configs, and test scaffolding"
git push origin main
```

---

## Phase 3: Install Required Jenkins Plugins

Go to **Jenkins > Manage Jenkins > Plugins > Available plugins** and install these (if not already installed):

| Plugin | Purpose |
|--------|---------|
| **Pipeline** | Declarative pipeline support |
| **Git** | SCM checkout |
| **SonarQube Scanner** | Code quality stage |
| **JaCoCo** | Java code coverage reports |
| **JUnit** | Test result publishing |
| **Pipeline Utility Steps** | `readJSON`, `readFile` in pipelines |
| **Credentials Binding** | `withCredentials` step |
| **Docker Pipeline** | Docker build/push in pipelines |

Restart Jenkins after installing:
```bash
microk8s kubectl rollout restart deployment/jenkins -n platform
```

---

## Phase 4: Configure Jenkins Tools

### 4a. SonarScanner (already configured via JCasC)

The `jenkins-casc-config.yaml` already auto-installs SonarScanner `5.0.1.3006` and configures the SonarQube server URL at `http://sonarqube.platform.svc.cluster.local`. This is loaded on Jenkins startup.

### 4b. Maven (for backend pipeline)

Go to **Jenkins > Manage Jenkins > Tools > Maven installations**:
- Name: `Maven-3.9`
- Check "Install automatically"
- Version: `3.9.6`

### 4c. JDK (for backend pipeline)

Go to **Jenkins > Manage Jenkins > Tools > JDK installations**:
- Name: `JDK-17`
- Check "Install automatically"
- Choose AdoptOpenJDK 17

---

## Phase 5: Create SonarQube Projects

Go to `http://sonar.local`:

1. **Create project "portal-fe":**
   - Projects > Create Project > Manually
   - Project Key: `portal-fe`, Name: `Banking Portal Frontend`
   - Set up: "With Jenkins"

2. **Create project "portal-be":**
   - Project Key: `portal-be`, Name: `Portal Backend`

3. **Quality Gate:** The default "Sonar way" quality gate works. It enforces:
   - No new bugs
   - No new vulnerabilities
   - Coverage > 80% on new code
   - Duplications < 3%

The SonarQube token is already stored in K8s secret `sonarqube-token-secret` and injected into Jenkins via the `SONAR_TOKEN` env var, which JCasC maps to credential `sonarqube-token`.

---

## Phase 6: Create Jenkins Pipeline Jobs

### Option A: Via Jenkins UI

**Job 1 -- portal-fe-main:**
1. Jenkins > New Item > Pipeline
2. Name: `portal-fe-main`
3. Check "This project is parameterized":
   - String Parameter: `ISSUE_KEY` (default empty)
   - String Parameter: `BRANCH` (default `main`)
4. Pipeline > Definition: "Pipeline script from SCM"
   - SCM: Git
   - URL: `https://github.com/loay-gadallah/devops-demo.git`
   - Credentials: `github-creds`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile-fe`
5. Save

**Job 2 -- portal-be-main:**
Same steps but:
   - Name: `portal-be-main`
   - Script Path: `Jenkinsfile-be`

### Option B: Via Jenkins CLI / API

Use the existing `pipeline-job.xml` as a template:

```bash
# Get Jenkins pod name
JENKINS_POD=$(microk8s kubectl get pods -n platform -l app=jenkins -o jsonpath='{.items[0].metadata.name}')

# Create FE job XML (modify scriptPath)
sed 's|Jenkinsfile|Jenkinsfile-fe|' infra/platform/jenkins/pipeline-job.xml > /tmp/fe-job.xml
sed 's|Jenkinsfile|Jenkinsfile-be|' infra/platform/jenkins/pipeline-job.xml > /tmp/be-job.xml

# Create jobs via Jenkins API
curl -X POST "http://jenkins.local/createItem?name=portal-fe-main" \
  -u "Gadallahlm:YOUR_PASSWORD" \
  -H "Content-Type: application/xml" \
  --data-binary @/tmp/fe-job.xml

curl -X POST "http://jenkins.local/createItem?name=portal-be-main" \
  -u "Gadallahlm:YOUR_PASSWORD" \
  -H "Content-Type: application/xml" \
  --data-binary @/tmp/be-job.xml
```

---

## Phase 7: Deploy App Manifests to Staging

The pipelines will do this automatically, but you can pre-create the deployments so they exist for `kubectl set image` to update:

```bash
microk8s kubectl apply -f infra/apps/staging/portal-fe.yaml
microk8s kubectl apply -f infra/apps/staging/portal-be.yaml
microk8s kubectl apply -f infra/apps/prod/portal-fe.yaml
microk8s kubectl apply -f infra/apps/prod/portal-be.yaml
```

These will show `ImagePullBackOff` initially (images don't exist yet) -- that's expected. The pipelines will build and push the images.

---

## Phase 8: Enable MicroK8s Registry

The pipelines push Docker images to `localhost:32000`. Enable the built-in registry:

```bash
microk8s enable registry
```

Verify it's running:
```bash
microk8s kubectl get pods -n container-registry
```

---

## Phase 9: Jira Setup for Approval Flow

In Jira at `http://jira.local`:

### 9a. Create Project
- Projects > Create project > Key: `DEVOPS`

### 9b. Add "Approved" Workflow Status
- Project Settings > Workflows > Edit
- Add status: `Approved` (category: Done)
- Add transition: `To Do` → `Approved` and `In Progress` → `Approved`
- Publish the workflow

### 9c. Create Issue Types
- Project Settings > Issue Types
- Ensure you have: `Task`, `Bug`, `Security`

### 9d. How Approval Works in the Pipeline

When the pipeline reaches Stage 7 (Release Approval):

1. If `ISSUE_KEY` parameter was passed, it uses that Jira issue
2. If not, it **auto-creates** a new Task issue in `DEVOPS` project via Jira REST API
3. Pipeline polls Jira every 15 seconds for up to 60 minutes
4. It checks if `issue.status.name == "Approved"` OR `issue.labels contains "approved"`
5. To approve: go to Jira, open the issue, transition it to "Approved" status (or add label `approved`)
6. Pipeline detects approval and proceeds to Pen Test → Deploy

---

## Phase 10: How Each Pipeline Stage Executes

### Stage-by-Stage Breakdown (using Jenkinsfile-fe as example):

**1. Clone** -- `checkout scm` pulls from GitHub using `github-creds` credential

**2. Unit Test** -- Runs inside `portal-fe/`:
```
npm ci --prefer-offline      # install deps
npm run test:ci               # runs: CI=true npx jest --ci --reporters=default --reporters=jest-junit
```
Produces: `portal-fe/reports/junit.xml` (published via JUnit plugin)

**3. Code Quality** -- Two sub-steps:
- SonarScanner runs using the auto-installed tool, sends results to `http://sonarqube.platform.svc.cluster.local`
- `waitForQualityGate` polls SonarQube webhook for pass/fail (5 min timeout)
- If gate fails → pipeline aborts + Jira comment posted

**4. Security Check (SAST)** -- Runs two tools:
- **Semgrep:** Scans `src/` with OWASP top-10 + JS rules + custom `semgrep-rules.yml`. Outputs JSON. If any `ERROR` severity findings → pipeline fails + Jira issue
- **OWASP Dependency-Check:** Scans `package.json` deps for known CVEs. Generates HTML + JSON reports

**5. Build** -- Docker multi-stage build:
```
docker build -t localhost:32000/portal-fe:<git-sha> .
docker push localhost:32000/portal-fe:<git-sha>
```
Uses `portal-fe/Dockerfile`: `node:18-alpine` builds → `nginx:alpine` serves

**6. Test** -- Deploys to staging namespace, then runs Cypress:
- Updates the staging deployment image to the new build
- Waits 15 seconds for rollout
- Runs Cypress E2E tests (`dashboard.cy.js`, `transfer.cy.js`)

**7. Release Approval** -- Jira polling (explained in Phase 9 above)

**8. Penetration Test** -- OWASP ZAP baseline scan:
- Runs ZAP Docker container against staging service URL
- Uses `zap-baseline.conf` rules (HIGH/CRITICAL = FAIL)
- If high-risk alerts found → pipeline fails + Jira Security issue created

**9. Deploy** -- Promotes **same image** (no rebuild) to `apps-prod`:
```
microk8s kubectl set image deployment/portal-fe portal-fe=localhost:32000/portal-fe:<git-sha> -n apps-prod
```
Waits for rollout to complete (120s timeout).

---

## Phase 11: Trigger a Build

### Option A: Manual trigger from Jenkins
1. Go to `http://jenkins.local/job/portal-fe-main/`
2. Click "Build with Parameters"
3. Leave `ISSUE_KEY` empty (auto-creates one) or enter an existing Jira issue key
4. Click "Build"

### Option B: Trigger from Jira (Automation Rule)
In Jira, set up an Automation Rule:
1. **Trigger:** Manual trigger (or issue transitioned)
2. **Action:** Send Web Request
   - URL: `http://jenkins.platform.svc.cluster.local/job/portal-fe-main/buildWithParameters`
   - Method: POST
   - Auth: Basic (`Gadallahlm` / password)
   - Body: `ISSUE_KEY={{issue.key}}&BRANCH=main`
3. Save and enable

### Option C: GitHub Webhook (auto-trigger on push)
1. In GitHub repo Settings > Webhooks > Add webhook
2. URL: `http://jenkins.local/github-webhook/`
3. Content type: `application/json`
4. Events: Just the push event

---

## Phase 12: Verify End-to-End

After a successful pipeline run:

```bash
# Check staging
microk8s kubectl get pods -n apps-staging

# Check production
microk8s kubectl get pods -n apps-prod

# Access production apps
# Add to /etc/hosts: 127.0.0.1 portal.local api.portal.local
curl http://portal.local        # Frontend
curl http://api.portal.local/api/accounts   # Backend API
```

---

## Tooling Not Installed on Jenkins Pod

The pipelines reference tools that need to be available inside the Jenkins agent. Since you're using `agent any` (the Jenkins controller itself), you need either:

**Option A: Install tools inside the Jenkins pod** (quick for demo):
```bash
JENKINS_POD=$(microk8s kubectl get pods -n platform -l app=jenkins -o jsonpath='{.items[0].metadata.name}')
microk8s kubectl exec -it -n platform $JENKINS_POD -- bash

# Inside pod:
apt-get update && apt-get install -y nodejs npm docker.io python3-pip
pip3 install semgrep
npm install -g newman
```

**Option B: Use Kubernetes pod agents** (production approach):
Update Jenkinsfiles to use `agent { kubernetes { ... } }` with container templates for node, maven, docker, etc. This is more robust but requires the Kubernetes plugin configured in Jenkins.

For the demo, Option A is simpler. The build stages that use `docker build` also need Docker socket access -- you may need to mount `/var/run/docker.sock` into the Jenkins pod or use MicroK8s's built-in container runtime.
