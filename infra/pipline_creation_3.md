# Pipeline Creation Log - v1.1 Rebuild

## Overview
Complete rebuild of portal-fe (React) and portal-be (Spring Boot) with modern banking UI, JWT authentication, PostgreSQL database, and full CRUD for Accounts/Cards/Transfers.

---

## Phase 1: Portal PostgreSQL Deployment

### 1.1 Created Portal PostgreSQL Secret
- File: `infra/bootstrap/02-secrets-template/portal-postgres-secret.yaml`
- Credentials: user=portal, db=portaldb
- Applied to `platform` namespace
- Copied to `apps-staging` and `apps-prod` namespaces

### 1.2 Created Portal PostgreSQL Deployment
- File: `infra/platform/postgres-portal/postgres-portal.yaml`
- Components: PVC (5Gi), Deployment (postgres:15-alpine), ClusterIP Service (port 5432)
- Readiness/liveness probes using `pg_isready`
- Verified pod running in `platform` namespace

---

## Phase 2: Backend Rebuild (Spring Boot + JPA + Security)

### 2.1 Dependencies Added (pom.xml)
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation
- postgresql driver
- jjwt (0.12.5) - JWT token generation/validation
- h2 (test scope)
- spring-security-test

### 2.2 JPA Entities
| Entity | Table | Key Fields |
|--------|-------|------------|
| User | users | id, username, password(BCrypt), fullName, email, role(ADMIN/USER) |
| Account | accounts | id, accountNumber, accountName, type(CHECKING/SAVINGS), currency, balance, status |
| Card | cards | id, cardNumber(masked), cardHolderName, type(DEBIT/CREDIT), expiryDate, status(ACTIVE/BLOCKED) |
| Transfer | transfers | id, fromAccount, toAccountNumber, beneficiaryName, amount, currency, type, status, reference |
| Transaction | transactions | id, account, type(CREDIT/DEBIT), amount, balance, description, reference |

### 2.3 Security Layer
- JwtTokenProvider - HS512 token generation/validation
- JwtAuthenticationFilter - Extract JWT from Authorization header
- SecurityConfig - Stateless sessions, CSRF disabled, permit /api/auth/** and /actuator/health
- BCrypt password encoding

### 2.4 REST API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/login | POST | Login, returns JWT |
| /api/auth/register | POST | Admin creates user |
| /api/dashboard | GET | Aggregate summary |
| /api/accounts | GET | User's accounts |
| /api/accounts/{id} | GET | Account detail |
| /api/accounts/{id}/transactions | GET | Account transactions |
| /api/cards | GET | User's cards |
| /api/cards/{id}/block | PUT | Block card |
| /api/cards/{id}/unblock | PUT | Unblock card |
| /api/transfers | GET/POST | List/create transfers |
| /api/users | GET/POST | Admin: list/create users |

### 2.5 Data Seeder
- Admin user: admin/admin123
- Demo user: demo/demo123
- 3 accounts, 2 cards, 5 transactions, 3 transfers per demo user

### 2.6 Total Files Created/Modified
- ~47 Java files (entities, repositories, DTOs, controllers, services, security, config, tests)

---

## Phase 3: Frontend Rebuild (React + Modern UI)

### 3.1 Dependencies Added
- axios ^1.6.0 (HTTP client with JWT interceptor)
- react-icons ^5.0.0 (navigation icons)

### 3.2 Architecture
- Pure CSS with banking color palette (deep navy #0f2042, teal accent #00b4d8)
- AuthContext with JWT localStorage management
- Axios interceptor for automatic JWT header injection
- Sidebar + Header layout with protected routes

### 3.3 Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | /login | Split layout with gradient + form |
| Dashboard | / | Stat cards + recent transfers table |
| Accounts | /accounts | Account card grid |
| Account Detail | /accounts/:id | Account info + transactions |
| Cards | /cards | Visual card representations, block/unblock |
| Card Detail | /cards/:id | Large card visual + actions |
| Transfers | /transfers | Transfer history |
| New Transfer | /transfers/new | 3-tab form: Internal/Local/International |

### 3.4 Nginx Configuration
- Serves React SPA with try_files fallback
- `/api/` reverse proxy to portal-be.apps-prod.svc.cluster.local:8080
- Uses `resolver 10.152.183.10` (kube-dns ClusterIP) with variable-based upstream to prevent startup failures
- `/health` endpoint for K8s probes

### 3.5 Total Files Created/Modified
- ~30 files (CSS, components, pages, services, context, tests)

---

## Phase 4: K8s Manifests Update

### 4.1 Backend Deployments (staging + prod)
- Added environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (from portal-postgres-secret)
- Added JWT_SECRET env var
- Set imagePullPolicy: Never
- Increased probe delays for JPA startup (45s liveness, 30s readiness)

### 4.2 Frontend Deployments (staging + prod)
- Set imagePullPolicy: Never

---

## Phase 5: Build, Deploy, Push, Webhook

### 5.1 Docker Image Builds
- **portal-be**: Built with `maven:3.9-eclipse-temurin-17` + `eclipse-temurin:17-jre`
  - First attempt failed (Docker Hub network timeout), retry succeeded
- **portal-fe**: Built with `node:18-alpine` + `nginx:alpine`
  - Successful on first attempt

### 5.2 Image Import to MicroK8s
Pattern used (registry not accessible from macOS):
```bash
docker save -o /tmp/<image>.tar localhost:32000/<image>:latest
multipass transfer /tmp/<image>.tar microk8s-vm:/tmp/
multipass exec microk8s-vm -- sudo microk8s ctr image import /tmp/<image>.tar
```

### 5.3 Deployment
- Applied updated K8s manifests to staging and prod
- Restarted deployments
- MicroK8s API server became temporarily unresponsive (TLS handshake timeout) due to resource pressure
- Resolved by restarting MicroK8s VM (`multipass restart microk8s-vm`)

### 5.4 FE Crash Fix
- Initial FE pods crashed: `host not found in upstream "portal-be.apps-prod.svc.cluster.local"`
- Root cause: nginx resolves upstreams at startup; if DNS not ready, nginx fails to start
- Fix: Changed nginx.conf to use `resolver 10.152.183.10` + variable-based `set $backend` so DNS resolution happens at request time
- Rebuilt FE image and redeployed

### 5.5 Verification
- All pods Running in apps-staging and apps-prod
- BE connected to PostgreSQL, DataSeeder created demo data
- Login API working: POST /api/auth/login with demo/demo123 returns JWT
- FE serving at http://portal.local (HTTP 200)
- API proxy working through FE: POST http://portal.local/api/auth/login returns JWT

### 5.6 Git Push
- Committed all changes (101 files, 25070 insertions)
- Pushed to GitHub: `git push origin main`

### 5.7 Jenkins Webhook Configuration
- Updated both `portal-be-main` and `portal-fe-main` job configs via Jenkins API
- Added `GitHubPushTrigger` for webhook-based builds
- Added SCM polling (every 5 minutes) as fallback since Jenkins is local
- Added `GitHubProjectProperty` with repo URL

---

## Final State

### Running Pods
| Namespace | Pod | Status |
|-----------|-----|--------|
| platform | portal-postgres | Running |
| apps-staging | portal-be | Running (1 replica) |
| apps-staging | portal-fe | Running (1 replica) |
| apps-prod | portal-be | Running (2 replicas) |
| apps-prod | portal-fe | Running (2 replicas) |

### Access URLs
| Service | URL | Credentials |
|---------|-----|-------------|
| Portal Frontend | http://portal.local | demo/demo123 |
| Portal API | http://api.portal.local | JWT required |
| Jenkins | http://jenkins.local | Gadallahlm/Loay!! |

### Demo Credentials
| User | Password | Role |
|------|----------|------|
| admin | admin123 | ADMIN |
| demo | demo123 | USER |
