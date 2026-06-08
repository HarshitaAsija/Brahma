# Database

PostgreSQL with pgvector extension and Neo4j knowledge graph.

## PostgreSQL

The `db` service in docker-compose runs PostgreSQL with the pgvector extension.

### Initialization

Scripts in `database/init/` are executed on container startup (if using the official PostgreSQL image). We use the ankane/pgvector image which already includes pgvector.

To manually enable pgvector:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Migrations

Use Alembic (see backend/alembic) for schema migrations.

## Neo4j

The `neo4j` service runs a Neo4j instance.

Default credentials (from docker-compose):
- Username: neo4j
- Password: password

### Import Tool

Place CSV files in `database/neo4j-import/` for use with Neo4j import tool.

## Backend Configuration

The backend connects to these databases via environment variables:
- `DATABASE_URL`
- `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`

See backend/.env.example for examples.
