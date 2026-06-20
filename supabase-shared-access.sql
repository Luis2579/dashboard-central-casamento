create table if not exists public.wedding_shared_dashboards (
  workspace_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wedding_shared_dashboards enable row level security;

create policy "Shared dashboard read"
on public.wedding_shared_dashboards for select
to authenticated
using (workspace_id = 'casamento-luis-francisco-maria-julia');

create policy "Shared dashboard create"
on public.wedding_shared_dashboards for insert
to authenticated
with check (workspace_id = 'casamento-luis-francisco-maria-julia');

create policy "Shared dashboard update"
on public.wedding_shared_dashboards for update
to authenticated
using (workspace_id = 'casamento-luis-francisco-maria-julia')
with check (workspace_id = 'casamento-luis-francisco-maria-julia');

alter publication supabase_realtime add table public.wedding_shared_dashboards;

create policy "Shared documents read"
on storage.objects for select
to authenticated
using (bucket_id = 'wedding-documents');

create policy "Shared documents upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'wedding-documents'
  and (storage.foldername(name))[1] = 'casamento-luis-francisco-maria-julia'
);

create policy "Shared documents update"
on storage.objects for update
to authenticated
using (bucket_id = 'wedding-documents')
with check (bucket_id = 'wedding-documents');

create policy "Shared documents delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'wedding-documents');
