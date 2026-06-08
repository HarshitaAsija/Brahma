# Import models to make them available for Alembic autogenerate
from .paper import Paper
from .gene import Gene

__all__ = ["Paper", "Gene"]