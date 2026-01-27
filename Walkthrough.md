# DevOps Demo Setup Walkthrough

This document summarizes the steps taken to resume and configure the Enterprise DevSecOps Demo on MicroK8s.

## 1. Platform Verification
- Verified status of all platform components (Jenkins, Jira, SonarQube, PostgreSQL).
- Confirmed all pods are `Running` in the `platform` namespace.

## 2. Jira Authentication Configuration
Due to trial license limitations preventing API Token generation, we switched to **Basic Authentication**:
- **Secret Created**: `infra/bootstrap/02-secrets-template/jira-creds-secret.yaml` containing Jira Username and Password.
- **Jenkins Config**:
    - Updated `jenkins.yaml` to inject `JIRA_USERNAME` and `JIRA_PASSWORD` environment variables.
    - Updated `jenkins-casc-config.yaml` to create a Jenkins credential with ID `jira-creds` using these values.
- **Applied Changes**: Redeployed Jenkins to apply the new configuration.

## 3. GitHub Integration
- **Local Repository**: Initialized git, created `.gitignore`, and committed code.
- **Authentication**:
    - Created `infra/bootstrap/02-secrets-template/github-creds-secret.yaml` for GitHub credentials (Username + PAT).
    - Configured Jenkins to use these credentials (ID `github-creds`) via environment variables and JCasC.
- **Synchronization**:
    - Linked local repository to user's GitHub remote.
    - Resolved history conflicts (rebase) and pushed the code to `main`.
- **Secrets Protection**: Updated `.gitignore` to ensure secret yaml files are NOT committed to the repository.

## 4. Jenkins Administration
- **Admin User**: Created a fixed Admin user (`infra/bootstrap/02-secrets-template/jenkins-admin-secret.yaml`) to allow programmatic access to Jenkins for automation.
- **Security Realm**: Configured Jenkins to use this local admin user.

## 5. Deployment Troubleshooting
- **Issue**: Jenkins deployment halted (stuck in `ContainerCreating`) due to a PersistentVolumeClaim (PVC) lock held by the terminating pod.
- **Resolution**: Forced deletion of the old Jenkins pod and performed a scale-down/scale-up sequence to release the volume and allow the new pod to start.

## 6. Pipeline Configuration
- **Job Definition**: Created `infra/platform/jenkins/pipeline-job.xml` defining the `devops-demo-pipeline`.
- **Job Creation**: Used Jenkins CLI to import this definition into the running Jenkins instance.

## Next Steps
- Verify the `devops-demo-pipeline` is visible in Jenkins.
- Trigger the first build.
- Monitor the pipeline execution Stages (Build -> SonarQube -> Quality Gate -> Deploy).
