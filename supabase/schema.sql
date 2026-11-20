create table if not exists public.journal_entries (
 user_id uuid not null references auth.users(id) on delete cascade,
 entry_date date not null,
 record jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key (user_id, entry_date),
 constraint record_is_object check (jsonb_typeof(record) = 'object')
);
create index if not exists journal_entries_user_date_idx on public.journal_entries (user_id, entry_date desc);
alter table public.journal_entries enable row level security;
revoke all on public.journal_entries from anon;
grant select, insert, update, delete on public.journal_entries to authenticated;
create policy "Read own entries" on public.journal_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own entries" on public.journal_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own entries" on public.journal_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own entries" on public.journal_entries for delete to authenticated using ((select auth.uid()) = user_id);
