alter table call_analyses
  add column if not exists lead_status text check (lead_status in ('closed', 'next_call', 'no_decision', 'lost')),
  add column if not exists lead_status_updated_at timestamptz;
