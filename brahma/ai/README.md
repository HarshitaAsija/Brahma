# AI Layer

AI components for Brahma using CrewAI, LangChain, BioBERT, and Ollama.

## Components

- `agents/`: AI agents definitions (CrewAI)
- `tasks/`: Task definitions for agents
- `tools/`: Custom tools for agents (e.g., literature search, PDF processing)
- `models/`: Model wrappers and configurations
- `chains/`: LangChain chains for specific tasks
- `utils/`: Utility functions
- `configs/`: Configuration files

## Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Ensure Ollama is running (see docker-compose)
3. Configure API keys if needed (e.g., for HuggingFace models)

## Usage

See individual module READMEs for details.
