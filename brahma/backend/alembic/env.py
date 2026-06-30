import os
import sys
from logging.config import fileConfig
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy import pool
from alembic import context

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.db.base import Base
from app.models.paper import Paper
from app.models.raw_paper import RawPaper
from app.models.entity import Entity
from app.models.entity_alias import EntityAlias
from app.models.paper_entity import PaperEntity
from app.models.relationship_instance import RelationshipInstance
from app.models.pipeline_task import PipelineTask
from app.core.config import settings

target_metadata = Base.metadata

def run_migrations_online():
    connectable = create_engine(settings.DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    raise RuntimeError("Offline mode not supported.")
else:
    run_migrations_online()
