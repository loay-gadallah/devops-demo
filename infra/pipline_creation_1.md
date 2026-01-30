# Pipeline Creation - Execution Log #1

---

## Step 1: Verify Platform Pods

```bash
microk8s kubectl get pods -n platform
```

**Result:** All 5 pods Running (jenkins, jira, postgres, sonarqube, sonarqube-postgres)

---

## Step 2: Enable MicroK8s Container Registry

```bash
microk8s enable registry
```

**Result:** Registry created (20Gi), namespace `container-registry`

---

## Step 3: Push Code to GitHub

```bash
git add portal-fe/ portal-be/ Jenkinsfile-fe Jenkinsfile-be security/ tests/ infra/apps/ \
       infra/pipline_creation_0.md infra/plan-v1.0.md infra/platform/jenkins/pipeline-job.xml \
       infra/platform/jenkins/jenkins-casc-config.yaml infra/platform/jenkins/jenkins.yaml README.md
git commit -m "Add applications, pipelines, security configs, and test scaffolding"
git push origin main
```

**Result:** `[main a7918fb] 52 files changed, 2623 insertions(+)` pushed to GitHub

---

## Step 4: Deploy App Manifests to Staging and Production

```bash
microk8s kubectl apply -f infra/apps/staging/portal-fe.yaml
microk8s kubectl apply -f infra/apps/staging/portal-be.yaml
microk8s kubectl apply -f infra/apps/prod/portal-fe.yaml
microk8s kubectl apply -f infra/apps/prod/portal-be.yaml
```

**Result:** Deployments, services, and ingresses created in `apps-staging` and `apps-prod`

---

## Step 5: Fix Calico Network Issue

New pods were failing with Calico auth error:

```
Failed to create pod sandbox: plugin type="calico" failed (add):
error getting ClusterInformation: connection is unauthorized: Unauthorized
```

**Fix:**

```bash
microk8s kubectl delete pod -n kube-system calico-node-x4fxg
```

After Calico node pod restarted, new pods could be created successfully.

---

## Step 6: Reset Jenkins Admin Password

Jenkins was rejecting `Loay!!` password despite correct K8s secret values.
Root cause: `runSetupWizard=true` in `JAVA_OPTS` meant the setup wizard ran first and set a different password hash.

**Fix:** Created a Groovy init script to reset the password:

```bash
microk8s kubectl exec -i -n platform -- $JENKINS_POD -- \
  tee /var/jenkins_home/init.groovy.d/reset-password.groovy <<'EOF'
import jenkins.model.*
import hudson.security.*
def instance = Jenkins.getInstance()
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("Gadallahlm", "Loay!!")
instance.setSecurityRealm(hudsonRealm)
instance.save()
EOF
```

Then scaled Jenkins down and back up:

```bash
microk8s kubectl scale deployment jenkins -n platform --replicas=0
sleep 5
microk8s kubectl scale deployment jenkins -n platform --replicas=1
```

**Note:** Due to `!!` characters in password, shell escaping was problematic.
Auth works with pre-encoded Basic auth header:

```
Authorization: Basic R2FkYWxsYWhsbTpMb2F5ISE=
```

(base64 of `Gadallahlm:Loay!!`)

---

## Step 7: Create Jenkins Pipeline Jobs via API

Jenkins CSRF crumb must be obtained and used within the same cookie session.

**Job XMLs** created at `/tmp/portal-fe-job.xml` and `/tmp/portal-be-job.xml`, then copied into the Jenkins pod:

```bash
microk8s kubectl cp /tmp/portal-fe-job.xml platform/$JENKINS_POD:/tmp/portal-fe-job.xml
microk8s kubectl cp /tmp/portal-be-job.xml platform/$JENKINS_POD:/tmp/portal-be-job.xml
```

**Job creation** executed from inside the pod to avoid auth/crumb issues:

```bash
microk8s kubectl exec -n platform -- $JENKINS_POD -- sh -c '
  CRUMB=$(curl -s -c /tmp/jcookies \
    -H "Authorization: Basic R2FkYWxsYWhsbTpMb2F5ISE=" \
    "http://localhost:8080/crumbIssuer/api/json" | \
    sed "s/.*crumb\":\"//" | sed "s/\".*//") && \
  curl -s -w "\nHTTP:%{http_code}" -b /tmp/jcookies \
    -H "Authorization: Basic R2FkYWxsYWhsbTpMb2F5ISE=" \
    -H "Jenkins-Crumb:$CRUMB" \
    -H "Content-Type: application/xml" \
    -X POST "http://localhost:8080/createItem?name=portal-fe-main" \
    --data-binary @/tmp/portal-fe-job.xml'
```

Repeated for `portal-be-main` with `Jenkinsfile-be`.

**Result:** Both jobs created (HTTP 200). Verified:

```json
{"jobs":[
  {"name":"portal-be-main"},
  {"name":"portal-fe-main"}
]}
```

---

## Step 8: Install Required Jenkins Plugins

```bash
microk8s kubectl exec -n platform -- $JENKINS_POD -- \
  jenkins-plugin-cli --plugins \
    workflow-aggregator \
    git \
    sonar \
    jacoco \
    junit \
    pipeline-utility-steps \
    credentials-binding \
    docker-workflow
```

**Result:** `Done` - all plugins installed

---

## Step 9: Create SonarQube Projects via API

```bash
SONAR_TOKEN=$(microk8s kubectl get secret sonarqube-token-secret -n platform \
  -o jsonpath='{.data.SONAR_TOKEN}' | base64 -d)

curl -s -u "${SONAR_TOKEN}:" -X POST \
  "http://sonar.local/api/projects/create?name=Banking+Portal+Frontend&project=portal-fe"

curl -s -u "${SONAR_TOKEN}:" -X POST \
  "http://sonar.local/api/projects/create?name=Portal+Backend&project=portal-be"
```

**Result:**

```json
{"project":{"key":"portal-fe","name":"Banking Portal Frontend","qualifier":"TRK","visibility":"public"}}
{"project":{"key":"portal-be","name":"Portal Backend","qualifier":"TRK","visibility":"public"}}
```

---

## Step 10: Cleanup and Restart Jenkins

Removed the password reset Groovy script (one-time use):

```bash
microk8s kubectl exec -n platform -- $JENKINS_POD -- \
  rm /var/jenkins_home/init.groovy.d/reset-password.groovy
```

Safe restart Jenkins for plugin activation (from inside pod):

```bash
curl -X POST "http://localhost:8080/safeRestart"  # with crumb + auth headers
```

**Result:** Jenkins restarted successfully, both jobs intact.

---

## Current State Summary

| Component | Status |
|-----------|--------|
| MicroK8s Registry | Enabled (20Gi) |
| GitHub Repo | Code pushed (a7918fb) |
| Jenkins Jobs | `portal-fe-main` + `portal-be-main` created |
| Jenkins Plugins | 8 plugins installed + restarted |
| SonarQube Projects | `portal-fe` + `portal-be` created |
| Staging Manifests | Deployed (ImagePullBackOff until first build) |
| Production Manifests | Deployed (ImagePullBackOff until first build) |

---

## Remaining Manual Steps

1. **Jenkins Tools Config** (UI): Add Maven `Maven-3.9` and JDK `JDK-17` auto-install
2. **Jenkins Pod Tools**: Install npm, semgrep, newman, dependency-check inside pod
3. **Docker Socket**: Mount `/var/run/docker.sock` into Jenkins pod for Docker builds
4. **Jira Setup**: Create DEVOPS project, add "Approved" workflow status
5. **Trigger First Build**: Manual or via API
