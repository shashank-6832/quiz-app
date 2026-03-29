# QuizByte — CS515 Assignment 03

A two-tier web quiz application built with React, Node.js/Express, and PostgreSQL.
Containerized with Docker and orchestrated with Kubernetes (Minikube).

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18 + Vite + Nginx |
| Backend   | Node.js + Express       |
| Database  | PostgreSQL 15           |
| Container | Docker + Docker Compose |
| Cluster   | Kubernetes (Minikube)   |

---

## Project Overview

QuizByte is a multiple-choice quiz application that:
- Serves 10 randomized CS/Networking questions fetched from a PostgreSQL database
- Tracks and saves player scores after each quiz attempt
- Displays a live leaderboard of the top 10 scores
- Runs as a containerized multi-tier application

---

## Phase 1 — Git Setup & Incremental Commits

Initialize your repository and push to GitHub with the following commit strategy.
This is the commit history you must replicate exactly.

```bash
# 1. Initialize repo
git init
git remote add origin https://github.com/<your-username>/quiz-app.git

# 2. Commit 1 — Project scaffold
git add .gitignore README.md
git commit -m "Initial project structure and README"

# 3. Commit 2 — Backend foundation
git add backend/package.json backend/index.js
git commit -m "Add Express backend with health route"

# 4. Commit 3 — Database integration
git add backend/index.js
git commit -m "Add PostgreSQL connection and database schema initialization"

# 5. Commit 4 — Seed data and API routes
git add backend/index.js
git commit -m "Add question seeding and /api/questions, /api/scores routes"

# 6. Commit 5 — Frontend scaffold
git add frontend/package.json frontend/vite.config.js frontend/index.html
git commit -m "Add React + Vite frontend scaffold"

# 7. Commit 6 — Frontend UI components
git add frontend/src/
git commit -m "Add WelcomeScreen, QuizScreen, and ResultScreen components"

# 8. Commit 7 — Styling
git add frontend/src/index.css
git commit -m "Add global CSS theme and component styles"

# 9. Commit 8 — Backend Dockerfile
git add backend/Dockerfile
git commit -m "Add multi-stage Dockerfile for backend"

# 10. Commit 9 — Frontend Dockerfile and Nginx config
git add frontend/Dockerfile frontend/nginx.conf
git commit -m "Add multi-stage Dockerfile and Nginx config for frontend"

# 11. Commit 10 — Docker Compose
git add docker-compose.yml
git commit -m "Add docker-compose.yml for local multi-container setup"

# 12. Commit 11 — Kubernetes manifests
git add k8s/
git commit -m "Add Kubernetes manifests for postgres, backend, and frontend"

# 13. Push
git push -u origin main
```

---

## Phase 2 — Docker

### Build images

```bash
# From the project root
docker build -t quiz-backend ./backend
docker build -t quiz-frontend ./frontend
```

### Run with Docker Compose

```bash
docker compose up --build
```

The app will be available at **http://localhost:3000**

### Useful commands

```bash
# View running containers
docker ps

# View all images
docker images

# View logs
docker compose logs -f backend

# Stop and remove containers
docker compose down
```

---

## Phase 3 — Kubernetes (Minikube)

### Prerequisites

```bash
# Start Minikube
minikube start

# Point Docker CLI to Minikube's Docker daemon
# (so Minikube can use your locally built images)
eval $(minikube docker-env)
```

### Build images inside Minikube's Docker context

```bash
# Run these AFTER eval $(minikube docker-env)
docker build -t quiz-backend:latest ./backend
docker build -t quiz-frontend:latest ./frontend
```

### Apply manifests

```bash
# Apply in order: database first, then backend, then frontend
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### Verify deployment

```bash
# Check all pods are Running
kubectl get pods

# Check services
kubectl get services

# Check deployments
kubectl get deployments
```

Expected output for `kubectl get pods`:
```
NAME                             READY   STATUS    RESTARTS   AGE
postgres-xxxxxxxxx-xxxxx         1/1     Running   0          2m
quiz-backend-xxxxxxxxx-xxxxx     1/1     Running   0          90s
quiz-backend-xxxxxxxxx-xxxxx     1/1     Running   0          90s
quiz-frontend-xxxxxxxxx-xxxxx    1/1     Running   0          60s
quiz-frontend-xxxxxxxxx-xxxxx    1/1     Running   0          60s
```

### Access the application

```bash
minikube service quiz-frontend
```

This opens the app in your browser via the Minikube tunnel.

Alternatively:
```bash
# Get the Minikube IP
minikube ip

# Then open: http://<minikube-ip>:30080
```

### Cleanup

```bash
kubectl delete -f k8s/
minikube stop
```

---

## API Reference

| Method | Endpoint        | Description               |
|--------|-----------------|---------------------------|
| GET    | /api/health     | Health check              |
| GET    | /api/questions  | Fetch all questions       |
| POST   | /api/scores     | Save a score              |
| GET    | /api/scores     | Get top 10 scores         |

---

## Submission Screenshots Required

1. `git log --oneline` — shows incremental commit history
2. `kubectl get pods` — shows all pods Running
3. App screenshot in browser



---

## Author
BADAVATH SHASHANK , 231109  — CS515 Unix Programming, IIIT Tiruchirappalli
