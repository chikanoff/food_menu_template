FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=2.1.3 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1 \
    POETRY_REQUESTS_TIMEOUT=120

RUN pip install --no-cache-dir "poetry==${POETRY_VERSION}"

COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root --no-ansi

COPY app ./app
COPY alembic.ini .
COPY alembic ./alembic

RUN mkdir -p /app/data /app/uploads

ENV DATABASE_URL=sqlite:////app/data/videomenu.db \
    MEDIA_ROOT=/app/uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
