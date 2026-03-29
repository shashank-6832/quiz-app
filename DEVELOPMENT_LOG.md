# QuizByte — Development Log & Troubleshooting Report

This document records all errors encountered during the development, containerization,
and deployment of the QuizByte quiz application, along with their fixes and improvements.

---

## Project Summary

| Item        | Detail                                      |
|-------------|---------------------------------------------|
| App         | QuizByte — MCQ Quiz App                     |
| Frontend    | React 18 + Vite + Nginx                     |
| Backend     | Node.js + Express                           |
| Database    | PostgreSQL 15                               |
| Container   | Docker + Docker Compose                     |
| Cluster     | Kubernetes via Minikube                     |
| GitHub      | https://github.com/shashank-6832/quiz-app   |

---

## Phase 1 — Git & Version Control

### Error 1: Remote origin already exists

**Command run:**
```bash
gh repo create quiz-app --public --source=. --remote=origin --push
```

**Error:**
```
X Unable to add remote "origin"
```

**Cause:**
A remote named `origin` had already been added manually via `git remote add origin` before
running the `gh` CLI command. The CLI tried to add it again, causing a conflict.

**Fix:**
```bash
git remote remove origin
git remote add origin https://github.com/shashank-6832/quiz-app.git
git branch -M main
git push -u origin main
```

---

### Error 2: GraphQL — Repository name already exists

**Error:**
```
GraphQL: Name already exists on this account (createRepository)
```

**Cause:**
The first `gh repo create` command successfully created the repository on GitHub
before failing on the remote step. Running it again tried to create a duplicate repo.

**Fix:**
Skipped the create step entirely since the repo already existed, and pushed directly:
```bash
git remote add origin https://github.com/shashank-6832/quiz-app.git
git branch -M main
git push -u origin main
```

---

### Error 3: Nothing to commit on incremental commits

**Command run:**
```bash
git add backend/index.js
git commit -m "Add PostgreSQL connection and database schema initialization"
```

**Error:**
```
On branch main
Your branch is up to date with 'origin/main'.
Untracked files:
  backend/Dockerfile
  docker-compose.yml
  frontend/
  k8s/
nothing added to commit but untracked files present
```

**Cause:**
All project files were written to disk at once before any git commands were run.
The first commit (`git add .`) had already included `backend/index.js`, so
subsequent attempts to stage it individually found nothing new to commit.

**Fix:**
Reorganized remaining untracked files into logical commit groups:
```bash
git add backend/Dockerfile
git commit -m "Add multi-stage Dockerfile for backend"

git add docker-compose.yml
git commit -m "Add docker-compose.yml for local multi-container setup"

git add frontend/
git commit -m "Add React frontend with Vite, components, and Nginx config"

git add k8s/
git commit -m "Add Kubernetes manifests for postgres, backend, and frontend"

git push
```

---

## Phase 2 — Docker

### Error 4: Docker permission denied

**Command run:**
```bash
docker build -t quiz-backend ./backend
docker build -t quiz-frontend ./frontend
```

**Error:**
```
ERROR: permission denied while trying to connect to the Docker daemon socket
at unix:///var/run/docker.sock
```

**Cause:**
The current Linux user was not part of the `docker` group, so it could not
communicate with the Docker daemon without `sudo`.

**Fix:**
```bash
sudo usermod -aG docker $USER
newgrp docker   # Apply without logging out
```

The `newgrp docker` command applied the group change to the current shell session
immediately without requiring a full logout/login.

---

## Phase 3 — Application Bug Fix

### Bug: Quiz not recognising correct answers properly

**Symptom:**
After selecting an answer, the correct answer was not being highlighted properly,
and the final score was not reflecting the actual number of correct answers.

**Root Cause:**
React state closure issue in `QuizScreen.jsx`. The `score` state inside `handleNext`
was capturing a stale value due to the asynchronous nature of `setState`. Additionally,
`handleNext` had redundant and incorrect logic when computing the final score to pass
to `onComplete`.

**Buggy code:**
```jsx
function handleSelect(index) {
  if (isAnswered) return;
  setSelected(index);
  if (index === question.correct_answer) {
    setScore((s) => s + 1);   // score updates async
  }
}

function handleNext() {
  if (isLast) {
    // BUG: 'score' here is stale — the last answer's point may not be counted
    const finalScore = selected === question.correct_answer ? score : score;
    onComplete(finalScore);
  } else {
    setCurrent((c) => c + 1);
    setSelected(null);
  }
}
```

**Fix:**
Removed the redundant stale score calculation in `handleNext` and passed
the `score` state directly, trusting the functional updater in `handleSelect`
to have already applied the update:

```jsx
function handleNext() {
  if (isLast) {
    onComplete(score);   // clean — no stale value logic
  } else {
    setCurrent((c) => c + 1);
    setSelected(null);
  }
}
```

After this fix, the app was rebuilt with:
```bash
docker compose up --build
```

And verified working correctly in the browser before proceeding to Kubernetes.

---

## Phase 4 — Kubernetes (Minikube)

### Error 5: Minikube not found

**Command run:**
```bash
minikube start
```

**Error:**
```
zsh: minikube: command not found...
```

**Cause:**
Minikube and kubectl were not installed on the system.

**Fix:**
```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl
rm kubectl
```

---

## Final Deployment — Successful Pod Output

After resolving all errors, all 5 pods reached `Running` status:

```
NAME                             READY   STATUS    RESTARTS   AGE
postgres-5df6bc78dd-8tr7t        1/1     Running   0          5m
quiz-backend-7f8f54b974-5r8f9    1/1     Running   0          5m
quiz-backend-7f8f54b974-x4jnk    1/1     Running   0          5m
quiz-frontend-5d5957769c-b5s58   1/1     Running   0          5m
quiz-frontend-5d5957769c-nlxpc   1/1     Running   0          5m
```

- 1 PostgreSQL pod
- 2 Backend replicas (as required by the assignment)
- 2 Frontend replicas (as required by the assignment)

---

## Key Improvements & Design Decisions

### Multi-stage Docker builds
Both the frontend and backend use multi-stage Dockerfiles to keep production images lean.
The frontend's final image contains only Nginx + static files — no Node.js at runtime.

### Database retry logic
The backend retries the PostgreSQL connection up to 10 times with a 3-second delay.
This handles the race condition where the backend container starts before PostgreSQL
is fully ready, which is common in both Docker Compose and Kubernetes environments.

### Non-root container user (backend)
The backend Dockerfile creates a dedicated non-root user (`quizuser`) and runs the
Node process as that user, following container security best practices.

### Kubernetes Secrets vs ConfigMaps
Sensitive database credentials (username, password) are stored in a Kubernetes `Secret`,
while non-sensitive config (host, port, db name) lives in a `ConfigMap`. This follows
the principle of least exposure.

### PersistentVolumeClaim for PostgreSQL
PostgreSQL data is stored on a `PersistentVolumeClaim` so quiz scores and questions
survive pod restarts.

### Nginx reverse proxy
The frontend Nginx config proxies all `/api/` requests to the backend service internally
within the cluster, so the browser only ever talks to one host.

---

## Author

**Shashank** — CS515 Unix Programming, IIIT Tiruchirappalli
Assignment 03 — Deadline: 29-03-2026
