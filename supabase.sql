-- ===== Таблица участников марафона =====
-- Выполни этот SQL в Supabase: проект -> SQL Editor -> New query -> Run

create table if not exists public.runners (
  id          bigint generated always as identity primary key,
  user_id     text,                       -- кто создал запись (email/id из Google-сессии)
  name        text,                       -- имя
  surname     text not null,              -- фамилия (по ней ищет телеграм-бот)
  email       text,                       -- email из Google
  phone       text,
  age         integer,
  gender      text,
  distance    text,
  city        text,
  value       text,                       -- нагрудный номер (его возвращает бот)
  created_at  timestamptz default now()
);

-- индекс для быстрого поиска по фамилии (бот ищет по surname)
create index if not exists runners_surname_idx on public.runners (lower(surname));

-- RLS можно оставить включённым: мы ходим в базу через service_role ключ
-- из серверных API-роутов, который RLS обходит. Прямого доступа из браузера нет.
alter table public.runners enable row level security;
