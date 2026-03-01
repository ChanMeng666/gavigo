-- 003_conversations.sql
-- Add conversations table for chat history tracking

-- Create conversations table
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  model text default 'gpt-4o-mini',
  message_count int default 0,
  total_tokens int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add new columns to chat_messages
alter table public.chat_messages add column if not exists model text;
alter table public.chat_messages add column if not exists token_count int;
alter table public.chat_messages add column if not exists word_count int;
alter table public.chat_messages add column if not exists status text default 'sent'
  check (status in ('sending', 'sent', 'failed'));

-- Backfill existing messages into conversations
-- Group by (user_id, conversation_id) and create one conversation per group
insert into public.conversations (id, user_id, title, message_count, created_at, updated_at)
select
  cm.conversation_id::uuid,
  cm.user_id::uuid,
  left((
    select content from public.chat_messages
    where conversation_id = cm.conversation_id
      and user_id = cm.user_id
      and role = 'user'
    order by created_at asc
    limit 1
  ), 50),
  count(*)::int,
  min(cm.created_at),
  max(cm.created_at)
from public.chat_messages cm
group by cm.conversation_id, cm.user_id
on conflict (id) do nothing;

-- Add FK from chat_messages to conversations (after backfill)
alter table public.chat_messages
  add constraint chat_messages_conversation_id_fkey
  foreign key (conversation_id) references public.conversations(id) on delete cascade;

-- Trigger to auto-update conversation metadata on message insert
create or replace function handle_chat_message_insert()
returns trigger as $$
begin
  -- Increment message_count and update updated_at
  update public.conversations
  set
    message_count = message_count + 1,
    total_tokens = total_tokens + coalesce(new.token_count, 0),
    updated_at = now(),
    -- Auto-set title from first user message if still null
    title = case
      when title is null and new.role = 'user' then left(new.content, 50)
      else title
    end
  where id = new.conversation_id::uuid;

  return new;
end;
$$ language plpgsql;

create trigger on_chat_message_insert
  after insert on public.chat_messages
  for each row
  execute function handle_chat_message_insert();

-- RLS policies for conversations
alter table public.conversations enable row level security;

create policy "Users can read own conversations"
  on public.conversations for select
  using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can update own conversations"
  on public.conversations for update
  using (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Index for fast lookups
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);
