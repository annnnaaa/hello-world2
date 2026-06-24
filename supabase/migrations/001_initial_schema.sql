-- ============================================================
-- ClearMind PWA — Initial Schema Migration
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- Custom ENUM types
-- ============================================================
create type public.thought_status as enum ('unsorted', 'converted', 'dismissed');
create type public.task_energy     as enum ('low', 'medium', 'high');
create type public.task_status     as enum ('active', 'hold', 'done');

-- ============================================================
-- Tables
-- ============================================================

-- profiles
create table public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url   text,
  theme        text not null default 'dark'
                 check (theme in ('dark', 'light', 'system')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- tags
create table public.tags (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  name       text not null,
  color      text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- brain_dump_entries
create table public.brain_dump_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

-- unsorted_thoughts
create table public.unsorted_thoughts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles on delete cascade,
  content       text not null,
  status        public.thought_status not null default 'unsorted',
  converted_to  text,
  converted_id  uuid,
  brain_dump_id uuid references public.brain_dump_entries on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- task_batches
create table public.task_batches (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  name       text not null,
  icon       text,
  color      text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- tasks
create table public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles on delete cascade,
  title        text not null,
  description  text,
  due_date     date,
  due_time     time,
  energy       public.task_energy not null default 'medium',
  batch_id     uuid references public.task_batches on delete set null,
  status       public.task_status not null default 'active',
  is_done      boolean not null default false,
  done_at      timestamptz,
  priority     integer not null default 0,
  unsorted_id  uuid references public.unsorted_thoughts on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- calendar_events
create table public.calendar_events (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles on delete cascade,
  title           text not null,
  description     text,
  location        text,
  start_at        timestamptz not null,
  end_at          timestamptz not null,
  all_day         boolean not null default false,
  color           text not null default '#6366f1',
  recurrence_rule text,
  unsorted_id     uuid references public.unsorted_thoughts on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- birthdays
create table public.birthdays (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,
  person_name text not null,
  birth_date  date not null,
  has_year    boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- notes
create table public.notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,
  title       text not null,
  content     text not null default '',
  unsorted_id uuid references public.unsorted_thoughts on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ideas
create table public.ideas (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles on delete cascade,
  title       text not null,
  description text,
  unsorted_id uuid references public.unsorted_thoughts on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- folders
create table public.folders (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles on delete cascade,
  parent_id  uuid references public.folders on delete cascade,
  name       text not null,
  color      text not null default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, parent_id, name)
);

-- documents
create table public.documents (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles on delete cascade,
  folder_id      uuid references public.folders on delete set null,
  name           text not null,
  description    text,
  file_path      text not null,
  file_size      bigint not null default 0,
  mime_type      text,
  storage_bucket text not null default 'documents',
  user_notes     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- document_tags (join table)
create table public.document_tags (
  document_id uuid not null references public.documents on delete cascade,
  tag_id      uuid not null references public.tags on delete cascade,
  primary key (document_id, tag_id)
);

-- thought_tags (join table)
create table public.thought_tags (
  thought_id uuid not null references public.unsorted_thoughts on delete cascade,
  tag_id     uuid not null references public.tags on delete cascade,
  primary key (thought_id, tag_id)
);

-- ============================================================
-- Indexes
-- ============================================================

-- user_id indexes (all user-owned tables)
create index idx_tags_user_id              on public.tags (user_id);
create index idx_brain_dump_entries_user_id on public.brain_dump_entries (user_id);
create index idx_unsorted_thoughts_user_id on public.unsorted_thoughts (user_id);
create index idx_task_batches_user_id      on public.task_batches (user_id);
create index idx_tasks_user_id             on public.tasks (user_id);
create index idx_calendar_events_user_id   on public.calendar_events (user_id);
create index idx_birthdays_user_id         on public.birthdays (user_id);
create index idx_notes_user_id             on public.notes (user_id);
create index idx_ideas_user_id             on public.ideas (user_id);
create index idx_folders_user_id           on public.folders (user_id);
create index idx_documents_user_id         on public.documents (user_id);

-- Domain-specific indexes
create index idx_tasks_due_date            on public.tasks (due_date);
create index idx_tasks_status              on public.tasks (status) where status = 'active';
create index idx_calendar_events_start_at  on public.calendar_events (start_at);
create index idx_calendar_events_end_at    on public.calendar_events (end_at);
create index idx_folders_parent_id         on public.folders (parent_id);
create index idx_documents_folder_id       on public.documents (folder_id);
create index idx_unsorted_thoughts_status  on public.unsorted_thoughts (status) where status = 'unsorted';

-- Full-text search indexes
create index idx_notes_fts on public.notes
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

create index idx_documents_fts on public.documents
  using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(user_notes, '')));

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Generic updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.calendar_events
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.birthdays
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.ideas
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.folders
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.unsorted_thoughts
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Handle new user → create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed default batches when a new profile is created
create or replace function public.seed_default_batches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.task_batches (user_id, name, icon, color, is_default) values
    (new.id, 'Paperwork & Admin', 'FileText',  '#6366f1', true),
    (new.id, 'Cleaning',         'Sparkles',   '#14b8a6', true),
    (new.id, 'Planning',         'Calendar',   '#f59e0b', true),
    (new.id, 'Project',          'Layers',     '#8b5cf6', true),
    (new.id, 'Running Around',   'MapPin',     '#ef4444', true);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.seed_default_batches();

-- ============================================================
-- RPC: capture_thought
-- Atomically creates a brain_dump_entry and unsorted_thought
-- ============================================================
create or replace function public.capture_thought(
  p_user_id uuid,
  p_content text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dump_id    uuid;
  v_thought_id uuid;
begin
  -- Create the brain dump entry
  insert into public.brain_dump_entries (user_id, content)
  values (p_user_id, p_content)
  returning id into v_dump_id;

  -- Create the unsorted thought linked to it
  insert into public.unsorted_thoughts (user_id, content, brain_dump_id)
  values (p_user_id, p_content, v_dump_id)
  returning id into v_thought_id;

  return json_build_object(
    'brain_dump_id', v_dump_id,
    'thought_id',    v_thought_id,
    'content',       p_content
  );
end;
$$;

-- ============================================================
-- Row-Level Security
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles           enable row level security;
alter table public.tags               enable row level security;
alter table public.brain_dump_entries  enable row level security;
alter table public.unsorted_thoughts  enable row level security;
alter table public.task_batches       enable row level security;
alter table public.tasks              enable row level security;
alter table public.calendar_events    enable row level security;
alter table public.birthdays          enable row level security;
alter table public.notes              enable row level security;
alter table public.ideas              enable row level security;
alter table public.folders            enable row level security;
alter table public.documents          enable row level security;
alter table public.document_tags      enable row level security;
alter table public.thought_tags       enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Generic user_id-based policies for all user-owned tables
-- tags
create policy "Users manage own tags"
  on public.tags for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- brain_dump_entries
create policy "Users manage own brain dumps"
  on public.brain_dump_entries for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- unsorted_thoughts
create policy "Users manage own thoughts"
  on public.unsorted_thoughts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- task_batches
create policy "Users manage own batches"
  on public.task_batches for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- tasks
create policy "Users manage own tasks"
  on public.tasks for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- calendar_events
create policy "Users manage own events"
  on public.calendar_events for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- birthdays
create policy "Users manage own birthdays"
  on public.birthdays for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- notes
create policy "Users manage own notes"
  on public.notes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ideas
create policy "Users manage own ideas"
  on public.ideas for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- folders
create policy "Users manage own folders"
  on public.folders for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- documents
create policy "Users manage own documents"
  on public.documents for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- document_tags (join table — check ownership via parent)
create policy "Users manage own document tags"
  on public.document_tags for all
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

-- thought_tags (join table — check ownership via parent)
create policy "Users manage own thought tags"
  on public.thought_tags for all
  using (
    exists (
      select 1 from public.unsorted_thoughts t
      where t.id = thought_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.unsorted_thoughts t
      where t.id = thought_id and t.user_id = auth.uid()
    )
  );

-- ============================================================
-- Storage: documents bucket policies
-- ============================================================

-- Create the documents bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Users can read their own files
create policy "Users can read own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can upload to their own folder
create policy "Users can upload own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own files
create policy "Users can delete own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
