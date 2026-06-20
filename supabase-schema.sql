create table if not exists public.wedding_dashboards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wedding_dashboards enable row level security;

create policy "Users read their wedding dashboard"
on public.wedding_dashboards for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create their wedding dashboard"
on public.wedding_dashboards for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their wedding dashboard"
on public.wedding_dashboards for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('wedding-documents', 'wedding-documents', false)
on conflict (id) do update set public = false;

create policy "Users upload their wedding documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'wedding-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "Users read their wedding documents"
on storage.objects for select to authenticated
using (bucket_id = 'wedding-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "Users update their wedding documents"
on storage.objects for update to authenticated
using (bucket_id = 'wedding-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));

create policy "Users delete their wedding documents"
on storage.objects for delete to authenticated
using (bucket_id = 'wedding-documents' and (storage.foldername(name))[1] = (select auth.uid()::text));
