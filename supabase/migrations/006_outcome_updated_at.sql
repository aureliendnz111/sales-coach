alter table call_analyses
  add column if not exists outcome_updated_at timestamptz;
