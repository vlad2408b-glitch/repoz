# Marathon Skills - веб-приложение регистрации на марафон

Веб-версия C#-приложения. Стек: **Next.js 14 (App Router) + NextAuth v4 (Google OAuth) + Supabase (PostgreSQL) + Telegram-бот**. Всё на serverless-функциях Vercel, в одном репозитории.

## Что внутри
- Главная (`/`) - инфо о марафоне (15 июня), кнопки «Регистрация» и «Список участников», обратный отсчёт до старта, кнопка `Admin` в правом нижнем углу.
- Регистрация (`/register`) - защищённый маршрут, без входа через Google кидает на `/login`. Сохраняет участника в Supabase, выдаёт нагрудный номер.
- Участники (`/participants`) - список всех зарегистрированных.
- Админка (`/admin`) - вход `admin / admin`, просмотр всех записей и удаление.
- Telegram-бот (`/api/telegram-webhook`) - отвечает на фамилию нагрудным номером из той же базы.

## Переменные окружения
Смотри `.env.local.example`. Нужны:
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN`, `TELEGRAM_BOT_TOKEN`.

## База данных
SQL для создания таблицы - в файле `supabase.sql`.

## Локальный запуск
```bash
npm install
cp .env.local.example .env.local   # и заполнить значения
npm run dev
```
Открыть http://localhost:3000

## Telegram webhook
После деплоя на Vercel выполнить (вставив свой токен и домен):
```
https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://<домен>.vercel.app/api/telegram-webhook
```
