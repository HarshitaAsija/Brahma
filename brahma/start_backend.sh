#!/bin/bash
cd /home/shalu/brahma_workspace/Brahma/brahma/backend
source ../.venv/bin/activate
PYTHONPATH=/home/shalu/brahma_workspace/Brahma/brahma \
uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload
