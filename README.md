# VideoMenu

Одноресторанный сайт видео-меню: публичная витрина по QR + админ-CMS. Каждый ресторан — отдельный деплой (своя БД, домен, `.env`).

## Стек

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn-style UI, Motion, **pnpm**
- Backend: FastAPI, SQLAlchemy, SQLite, **Poetry**
- Deploy: Docker Compose + Nginx

## Быстрый старт (локально)

### Backend

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/api/v1/health
- Демо-админ: `admin` / `admin123` (из env)

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

- Сайт: http://127.0.0.1:5173
- Админка: http://127.0.0.1:5173/admin

Vite проксирует `/api` и `/media` на backend `:8000`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Откройте http://localhost

Сборка: API через Poetry (`poetry install`), фронт через pnpm (`pnpm install --frozen-lockfile`).

## Клонирование под новый ресторан

1. Скопируйте репозиторий / папку проекта.
2. Задайте в `.env`: `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, домен в `CORS_ORIGINS` и `PUBLIC_BASE_URL`.
3. Поднимите `docker compose up -d --build`.
4. Войдите в `/admin`, замените название, цвета, логотип, контакты.
5. Создайте категории и блюда, загрузите фото/видео.
6. Сгенерируйте QR на публичный URL сайта.

## Рекомендации по видео

- Формат: MP4 (H.264) или WebM, вертикаль 9:16 или 4:5.
- Длительность: 5–15 секунд, без звука (autoplay muted).
- Размер: до 40 MB (лимит `MAX_VIDEO_MB`), лучше 5–15 MB.
- HandBrake preset: Social / Web → Fast 720p30, bitrate ~2–4 Mbps.
- Всегда добавляйте poster (кадр-обложку).

## Backup

Сохраняйте volume с SQLite (`db_data`) и `uploads_data`.

## Структура API (кратко)

- Public: `GET /api/v1/restaurant|categories|dishes|promotions`
- Admin: JWT login + CRUD категорий/блюд/медиа/акций/настроек + `POST /api/v1/admin/upload`

## Prod checklist

- [ ] Сменить `SECRET_KEY` и пароль админа
- [ ] Настроить HTTPS (Caddy/Nginx перед compose)
- [ ] Бэкап SQLite + uploads
- [ ] Проверить лимиты upload и размеры видео
- [ ] Проверить сайт на телефоне по QR

## Деплой на Railway (демо)

1. Залейте репозиторий на GitHub (если ещё не заливали).
2. На [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Выберите этот репозиторий. Если Railway предложит **Docker Compose** — включите (файл `docker-compose.yml` в корне).
4. В сервисе **api** задайте Variables:

```
SECRET_KEY=<длинная-случайная-строка>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<надёжный-пароль>
DATABASE_URL=sqlite:////app/data/videomenu.db
MEDIA_ROOT=/app/uploads
CORS_ORIGINS=https://<ваш-домен>.up.railway.app
PUBLIC_BASE_URL=https://<ваш-домен>.up.railway.app
```

5. У сервиса **web** включите **Public Networking** (Generate Domain) — это публичный URL демо.
6. Для **api** Public Networking **не нужен** (nginx проксирует `/api` и `/media` внутри сети).
7. На **api** добавьте Volume(s):
   - mount `/app/data` (SQLite)
   - mount `/app/uploads` (фото/видео)
8. Дождитесь деплоя → откройте домен web → `/admin` с логином/паролем из Variables.

### CLI (альтернатива)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

После первого деплоя в Dashboard привяжите домен к **web** и пропишите его в `CORS_ORIGINS` / `PUBLIC_BASE_URL`.

> SQLite + volumes на Railway ок для демо одного заведения. Для серьёзного продакшена позже можно сменить `DATABASE_URL` на Postgres без смены архитектуры продукта.
