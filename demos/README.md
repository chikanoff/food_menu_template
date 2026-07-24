# Demo videos

Готовые превью для демонстрации клиентам:

| Файл | Формат | Длительность |
|------|--------|--------------|
| `videomenu-demo-mobile.mp4` | 1080×2338 (iPhone 12 Pro aspect) | ~27 с |
| `videomenu-demo-desktop.mp4` | 1440×900 | ~21 с |

Сценарий: герой → избранное → меню → карточка блюда → категория → снова главная.

Мобильный ролик пишется 1:1 с viewport (390×844), затем апскейлится в ffmpeg — иначе Playwright сжимает сайт в узкую полоску.

## Переснять

```bash
npm install --no-save playwright
npx playwright install chromium
node scripts/record-demo.mjs --base http://127.0.0.1 --out demos --only mobile

docker run --rm -v "%CD%/demos:/work" linuxserver/ffmpeg:version-7.1-cli -y ^
  -i /work/videomenu-demo-mobile.webm ^
  -vf "scale=1080:-2:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -crf 17 -an ^
  /work/videomenu-demo-mobile.mp4
```

Для продакшена с реальными видео-блюдами:

```bash
node scripts/record-demo.mjs --base http://YOUR_VPS_IP --out demos --only mobile
```
