-- Enable pgvector for embeddings (objection similarity search)
create extension if not exists vector;

-- ============================================================
-- SCRIPTS & PROCESS
-- ============================================================

create table scripts (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,  -- Clerk user ID
  name        text not null,
  goal        text,
  duration_minutes integer default 30,
  reminders   text[],
  is_default  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table steps (
  id                      uuid primary key default gen_random_uuid(),
  script_id               uuid not null references scripts(id) on delete cascade,
  "order"                 integer not null,
  name                    text not null,
  goal                    text,
  duration_estimate_minutes integer,
  key_phrases             text[],
  questions               text[],
  tips                    text[],
  created_at              timestamptz default now()
);

create table objections (
  id              uuid primary key default gen_random_uuid(),
  script_id       uuid not null references scripts(id) on delete cascade,
  "order"         integer not null,
  label           text not null,
  category        text not null, -- price | budget | stall | timing | competition | doubt | third_party
  trigger_phrases text[],
  applicable_step_orders integer[],
  responses       text[],
  key_reframe     text,
  embedding       vector(1536),  -- pour similarité sémantique future
  created_at      timestamptz default now()
);

-- ============================================================
-- CALL SESSIONS
-- ============================================================

create table call_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  script_id       uuid references scripts(id),
  prospect_name   text,
  prospect_notes  text,
  started_at      timestamptz,
  ended_at        timestamptz,
  status          text default 'idle', -- idle | live | completed
  created_at      timestamptz default now()
);

create table transcript_segments (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references call_sessions(id) on delete cascade,
  speaker         text default 'prospect', -- coach | prospect
  text            text not null,
  ts_ms           bigint not null,  -- timestamp en ms depuis started_at
  step_detected   integer,          -- order de l'étape détectée
  created_at      timestamptz default now()
);

create table suggestions (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references call_sessions(id) on delete cascade,
  objection_id    uuid references objections(id),
  objection_label text,
  suggestion_text text not null,
  shown_at        timestamptz default now(),
  used_at         timestamptz,
  dismissed_at    timestamptz
);

-- ============================================================
-- ANALYTICS
-- ============================================================

create table session_analytics (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references call_sessions(id) on delete cascade,
  steps_completed       integer[],
  duration_seconds      integer,
  objections_handled    integer default 0,
  objections_detail     jsonb,  -- {objection_id: count}
  outcome               text,   -- closed | no_close | follow_up
  created_at            timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index on steps(script_id, "order");
create index on objections(script_id);
create index on call_sessions(user_id, status);
create index on transcript_segments(session_id, ts_ms);
create index on suggestions(session_id, shown_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table scripts enable row level security;
alter table steps enable row level security;
alter table objections enable row level security;
alter table call_sessions enable row level security;
alter table transcript_segments enable row level security;
alter table suggestions enable row level security;
alter table session_analytics enable row level security;

-- Politique : chaque user ne voit que ses données
-- Note: user_id = Clerk user ID passé via JWT ou service role
create policy "users_own_scripts" on scripts
  for all using (user_id = current_setting('app.user_id', true));

create policy "users_own_steps" on steps
  for all using (
    script_id in (select id from scripts where user_id = current_setting('app.user_id', true))
  );

create policy "users_own_objections" on objections
  for all using (
    script_id in (select id from scripts where user_id = current_setting('app.user_id', true))
  );

create policy "users_own_sessions" on call_sessions
  for all using (user_id = current_setting('app.user_id', true));

create policy "users_own_segments" on transcript_segments
  for all using (
    session_id in (select id from call_sessions where user_id = current_setting('app.user_id', true))
  );

create policy "users_own_suggestions" on suggestions
  for all using (
    session_id in (select id from call_sessions where user_id = current_setting('app.user_id', true))
  );

create policy "users_own_analytics" on session_analytics
  for all using (
    session_id in (select id from call_sessions where user_id = current_setting('app.user_id', true))
  );
