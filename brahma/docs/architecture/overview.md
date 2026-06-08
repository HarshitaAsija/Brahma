# Architecture Overview

Brahma consists of five main components:

1. **Frontend** (Next.js) - User interface for researchers
2. **Backend** (FastAPI) - RESTful API and business logic
3. **AI Layer** (CrewAI, LangChain, BioBERT, Ollama) - Intelligent agents for literature search, evidence extraction, and report generation
4. **Database** (PostgreSQL + pgvector) - Structured data storage with vector embeddings
5. **Knowledge Graph** (Neo4j) - Connected knowledge of genes, proteins, diseases, drugs, and research papers

## Data Flow

- Literature is ingested via PubMed, PMC, bioRxiv, medRxiv, and PDF (via Grobid)
- Extracted entities and relationships are stored in PostgreSQL and Neo4j
- AI agents query the databases and use LLMs to assist research
- Users interact through the frontend to search, visualize, and generate reports

## Technology Choices

- **Next.js** for React-based SSR/frontend with TypeScript safety
- **FastAPI** for high-performance async Python API
- **PostgreSQL + pgvector** for relational data + vector similarity search
- **Neo4j** for graph-oriented knowledge representation
- **Docker** for containerization and reproducibility
- **GitHub Actions** for CI/CD
