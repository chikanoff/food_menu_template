# VideoMenu

Одноресторанный сайт видео-меню: публичная витрина по QR + админ-CMS. Каждый ресторан — отдельный деплой (своя БД, домен, `.env`).

## Стек

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn-style UI, Motion, **pnpm**
- Backend: FastAPI, SQLAlchemy, SQLite, **Poetry**
- Deploy: Docker Compose + Nginx на VPS

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

## Docker (локально)

```bash
cp .env.example .env
docker compose up --build
```

Откройте http://localhost

## Деплой на VPS (Ubuntu 24.04)

Нужен пустой VPS с публичным IP. Seed демо-меню выполняется при первом старте API автоматически.

### 1. Подключитесь по SSH

```bash
ssh root@YOUR_VPS_IP
```

### 2. Установите Docker

```bash
apt-get update
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker
```

### 3. Клонируйте проект

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/chikanoff/food_menu_template.git videomenu
cd videomenu
```

### 4. Настройте `.env`

```bash
cp .env.example .env
nano .env
```

Обязательно замените:

```
SECRET_KEY=<длинная-случайная-строка>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<надёжный-пароль>
CORS_ORIGINS=http://YOUR_VPS_IP
PUBLIC_BASE_URL=http://YOUR_VPS_IP
```

Если уже есть домен:

```
CORS_ORIGINS=https://menu.example.com
PUBLIC_BASE_URL=https://menu.example.com
```

### 5. Откройте порт 80 (если ufw включён)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 6. Запустите

```bash
docker compose up -d --build
docker compose ps
curl -s http://127.0.0.1/api/v1/health
```

Откройте в браузере: `http://YOUR_VPS_IP`  
Админка: `http://YOUR_VPS_IP/admin`

### 7. Обновление

```bash
cd /opt/videomenu
git pull
docker compose up -d --build
```

### HTTPS (по желанию)

Проще всего поставить Caddy перед контейнерами или пробросить 443. Для демо по IP достаточно HTTP.

## Клонирование под новый ресторан

1. Новый VPS или отдельная папка/compose-проект.
2. Свой `.env` (секрет, пароль, домен/IP).
3. `docker compose up -d --build`.
4. В `/admin` заменить бренд, цвета, меню.
5. QR на публичный URL.

## Производительность (карточки меню)

- В сетке меню **нет `<video>`**: только poster/фото + бейдж «Видео».
- Видео грузится **на странице блюда**, лениво (IntersectionObserver), `preload="none/metadata"`.
- На Save-Data / 2G / reduced-motion автоплей отключён.
- Картинки: `loading="lazy"`, `decoding="async"`, `content-visibility` на карточках.

## Рекомендации по видео

- Формат: MP4 (H.264) или WebM, вертикаль 9:16 или 4:5.
- Длительность: 5–15 секунд, без звука.
- Размер: до 40 MB (лимит `MAX_VIDEO_MB`), лучше **2–8 MB**.
- HandBrake: Social / Web → Fast 720p30, bitrate ~1.5–3 Mbps.
- **Обязателен poster** (кадр-обложка) — без него в меню будет пустая заглушка.

## Backup

```bash
docker compose exec api ls /app/data /app/uploads
# volumes: db_data, uploads_data
docker run --rm -v videomenu_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tgz -C /data .
docker run --rm -v videomenu_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tgz -C /data .
```

Имена volume могут отличаться (`docker volume ls`).

## Структура API (кратко)

- Public: `GET /api/v1/restaurant|categories|dishes|promotions|menu`
- Admin: JWT login + CRUD категорий/блюд/медиа/акций/настроек + `POST /api/v1/admin/upload`

## Prod checklist

- [ ] Сменить `SECRET_KEY` и пароль админа
- [ ] Прописать IP/домен в `CORS_ORIGINS` и `PUBLIC_BASE_URL`
- [ ] Открыть порт 80 (и 443 при HTTPS)
- [ ] Бэкап SQLite + uploads
- [ ] Проверить сайт на телефоне по QR
