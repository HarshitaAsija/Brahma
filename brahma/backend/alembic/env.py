import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Ensure the app's package is on the PYTHONPATH
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# -----------------------------------------------------------------
# Import the model MetaData object for "autogenerate"
# -----------------------------------------------------------------
from app.db.base import Base  # noqa: E402
# Import every model so Alembic sees them
from app.models.paper import Paper  # noqa: E402
from app.models.raw_paper import RawPaper  # noqa: E402
from app.models.entity import Entity  # noqa: E402
from app.models.entity_alias import EntityAlias  # noqa: E402
from app.models.paper_entity import PaperEntity  # noqa: E402
from app.models.relationship_instance import RelationshipInstance  # noqa: E402
from app.models.pipeline_task import PipelineTask  # noqa: E402

target_metadata = Base.metadata
# -----------------------------------------------------------------

def run_migrations_online():
    """Run migrations in 'online' mode.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_as_batch=True,  # safe for SQLite testing; harmless on PostgreSQL
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    raise RuntimeError("Offline mode not supported for this project.")
else:
    run_migrations_online()
