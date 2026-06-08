# Backend

FastAPI-based Python backend for Brahma.

## Features

- FastAPI app with health check endpoint
- Environment configuration using pydantic-settings
- Logging setup
- SQLAlchemy database configuration with PostgreSQL
- Docker support

## Setup

### Prerequisites

- Python 3.8+
- Docker (optional, for containerized deployment)
- PostgreSQL (if not using Docker)

### Local Development

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:
   - On macOS/Linux: `source venv/bin/activate`
   - On Windows: `venv\Scripts\activate`
5. Install dependencies: `pip install -r requirements.txt`
6. Create a `.env` file (copy from `.env.example` and adjust as needed):
   ```bash
   cp .env.example .env
   ```
7. Start the PostgreSQL database (if not running):
   - Using Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=brahma -p 5432:5432 -d postgres`
   - Or install PostgreSQL locally and create a database named `brahma`
8. Run the database migrations (if any):
   ```bash
   alembic upgrade head
   ```
9. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
10. The API will be available at `http://localhost:8000`

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t brahma-backend .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 --name brahma-backend \
     -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/brahma \
     -e DEBUG=1 \
     brahma-backend
   ```
   Note: For the database connection, you may need to adjust the host depending on your setup.
   - If running PostgreSQL in another container, use the service name from your docker-compose.
   - For host.docker.internal to work on Linux, you may need to add `--add-host=host.docker.internal:host-gateway` to the docker run command.

### Testing the API

Once the server is running, you can test the endpoints:

- Health check: `GET http://localhost:8000/health`
- Root endpoint: `GET http://localhost:8000/`

You can also visit the interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Environment Variables

See `.env.example` for a list of available environment variables and their descriptions.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   ├── dependencies/
│   │   └── schemas/
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── utils.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   ├── crud/
│   ├── services/
│   ├── tests/
│   └── main.py
├── alembic/
├── tests/
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── alembic.ini
```

## License

MIT