"""Add dish_media.preview_url for lightweight card video loops.

Revision ID: 002_media_preview
Revises: 001_initial
Create Date: 2026-07-24
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_media_preview"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("dish_media", sa.Column("preview_url", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("dish_media", "preview_url")
