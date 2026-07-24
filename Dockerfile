# ---- frontend ----
FROM node:22-alpine AS frontend-build
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /web
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
RUN pnpm build

# ---- runtime (single service for Railway) ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=2.1.3 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    PORT=8080 \
    DATABASE_URL=sqlite:////app/data/videomenu.db \
    MEDIA_ROOT=/app/uploads

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base curl ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir "poetry==${POETRY_VERSION}" \
    && rm -f /etc/nginx/sites-enabled/default

WORKDIR /app

COPY backend/pyproject.toml backend/poetry.lock ./
RUN poetry install --only main --no-root --no-ansi

COPY backend/app ./app
COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic

COPY --from=frontend-build /web/dist /usr/share/nginx/html
COPY nginx/nginx.railway.conf.template /etc/nginx/nginx.railway.conf.template
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh \
    && mkdir -p /app/data /app/uploads

EXPOSE 8080
CMD ["/app/start.sh"]
