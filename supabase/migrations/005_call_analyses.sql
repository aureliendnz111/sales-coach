create table call_analyses (
  id                  uuid primary key default gen_random_uuid(),
  user_id             text not null,
  script_id           uuid references scripts(id) on delete set null,
  transcript_text     text not null,
  transcript_filename text,
  prospect_name       text,
  call_date           date,
  outcome             text check (outcome in ('closed', 'next_call', 'no_decision', 'lost')),
  scores              jsonb,
  recommendations     jsonb,
  talk_ratio          jsonb,
  status              text default 'analyzing' check (status in ('analyzing', 'done', 'error', 'archived')),
  created_at          timestamptz default now()
);

create index on call_analyses(user_id, created_at desc);

alter table call_analyses enable row level security;

create policy "Users manage own analyses" on call_analyses
  for all using (user_id = current_setting('app.user_id', true));
