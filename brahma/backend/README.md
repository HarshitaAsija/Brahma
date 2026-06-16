# Brahma – Local Setup Guide

## Prerequisites

- Docker Desktop (with WSL2 integration enabled)
- Python 3.10+
- Node.js 20+

---

## Step 1: Start the Database (PostgreSQL via Docker)

```bash
cd ~/Brahma/brahma/backend
docker compose up -d postgres
```

Verify it's running:

```bash
docker ps | grep central-db
```

---

## Step 2: Start Neo4j

```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5
```

---

## Step 3: Start Ollama (LLM)

```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama

docker exec -it ollama ollama pull llama2
```

---

## Step 4: Create the Backend `.env` File

```bash
cat > ~/Brahma/brahma/backend/.env <<'EOF'
POSTGRES_SERVER=localhost
POSTGRES_USER=central_admin
POSTGRES_PASSWORD=centralDb13
POSTGRES_DB=central_db
POSTGRES_PORT=5432
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_STRING
DEBUG=True
EOF
```

---

## Step 5: Set Up Python Virtual Environment & Install Dependencies

```bash
cd ~/Brahma/brahma/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install pgvector
```

---

## Step 6: Run Database Migrations

If running for the first time on a fresh database:

```bash
alembic upgrade head
```

If the database already has tables from a previous setup (to avoid `DuplicateObject` errors):

```bash
alembic stamp 20240611_01_initial_mvp
alembic upgrade head
```

---

## Step 7: Start the Backend

```bash
cd ~/Brahma/brahma/backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

---

## Step 8: Start the Frontend (new terminal)

```bash
cd ~/Brahma/brahma/frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Startup Order Summary

| Order | Service    | Command                                      |
|-------|------------|----------------------------------------------|
| 1     | PostgreSQL | `docker compose up -d postgres`              |
| 2     | Neo4j      | `docker run ... neo4j:5`                     |
| 3     | Ollama     | `docker run ... ollama/ollama`               |
| 4     | Backend    | `uvicorn app.main:app --reload`              |
| 5     | Frontend   | `npm run dev`                                |

---

## Stopping Everything

```bash
# Stop backend and frontend with Ctrl+C in their terminals

# Stop Docker containers
cd ~/Brahma/brahma/backend
docker compose down
docker stop neo4j ollama
docker rm neo4j ollama
```

---

## Quick Verification Checklist

| Service    | How to verify                                          |
|------------|--------------------------------------------------------|
| PostgreSQL | `docker ps \| grep central-db`                         |
| Neo4j      | Open http://localhost:7474 → login: neo4j / password   |
| Ollama     | `curl http://localhost:11434/api/tags`                 |
| Backend    | `curl http://localhost:8000/health` → `{"status":"ok"}`|
| Frontend   | Open http://localhost:3000                             |
