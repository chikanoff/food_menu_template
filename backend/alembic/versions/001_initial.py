"""empty message

Revision ID: 001_initial
Revises:
Create Date: 2026-07-23
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "restaurant_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200)),
        sa.Column("slug", sa.String(200)),
        sa.Column("description", sa.Text()),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("cover_url", sa.String(500), nullable=True),
        sa.Column("primary_color", sa.String(20)),
        sa.Column("accent_color", sa.String(20)),
        sa.Column("phone", sa.String(50)),
        sa.Column("address", sa.String(300)),
        sa.Column("working_hours", sa.String(200)),
        sa.Column("map_url", sa.String(500), nullable=True),
        sa.Column("instagram_url", sa.String(500), nullable=True),
        sa.Column("telegram_url", sa.String(500), nullable=True),
        sa.Column("whatsapp_url", sa.String(500), nullable=True),
        sa.Column("is_published", sa.Boolean()),
    )
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(100), unique=True),
        sa.Column("password_hash", sa.String(255)),
    )
    op.create_index("ix_admins_username", "admins", ["username"])
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200)),
        sa.Column("slug", sa.String(200)),
        sa.Column("description", sa.Text()),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("sort_order", sa.Integer()),
        sa.Column("is_active", sa.Boolean()),
        sa.UniqueConstraint("slug", name="uq_categories_slug"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"])
    op.create_table(
        "promotions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200)),
        sa.Column("description", sa.Text()),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("video_url", sa.String(500), nullable=True),
        sa.Column("starts_at", sa.DateTime(), nullable=True),
        sa.Column("ends_at", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean()),
        sa.Column("sort_order", sa.Integer()),
    )
    op.create_table(
        "dishes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id", ondelete="CASCADE")),
        sa.Column("name", sa.String(200)),
        sa.Column("slug", sa.String(200)),
        sa.Column("description", sa.Text()),
        sa.Column("composition", sa.Text()),
        sa.Column("price", sa.Numeric(10, 2)),
        sa.Column("currency", sa.String(10)),
        sa.Column("weight_g", sa.Integer(), nullable=True),
        sa.Column("calories", sa.Integer(), nullable=True),
        sa.Column("is_available", sa.Boolean()),
        sa.Column("is_featured", sa.Boolean()),
        sa.Column("sort_order", sa.Integer()),
        sa.UniqueConstraint("slug", name="uq_dishes_slug"),
    )
    op.create_index("ix_dishes_slug", "dishes", ["slug"])
    op.create_index("ix_dishes_category_id", "dishes", ["category_id"])
    op.create_table(
        "dish_media",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("dish_id", sa.Integer(), sa.ForeignKey("dishes.id", ondelete="CASCADE")),
        sa.Column("type", sa.String(20)),
        sa.Column("url", sa.String(500)),
        sa.Column("poster_url", sa.String(500), nullable=True),
        sa.Column("sort_order", sa.Integer()),
        sa.Column("is_primary", sa.Boolean()),
    )
    op.create_index("ix_dish_media_dish_id", "dish_media", ["dish_id"])


def downgrade() -> None:
    op.drop_table("dish_media")
    op.drop_table("dishes")
    op.drop_table("promotions")
    op.drop_table("categories")
    op.drop_table("admins")
    op.drop_table("restaurant_settings")
