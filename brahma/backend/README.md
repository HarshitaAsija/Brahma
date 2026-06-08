# Backend

FastAPI-based Python backend for Brahma.

## Setup

1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Set up environment variables: copy `.env.example` to `.env` and adjust.
5. Run migrations: `alembic upgrade head`
6. Start the server: `uvicorn app.main:app --reload`

## API Documentation

Once running, visit `http://localhost:8000/docs` for Swagger UI.
