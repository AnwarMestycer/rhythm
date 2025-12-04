-- Create the reminders table
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text not null, -- hydration, posture, break, meal, gym, prayer, wake-up, custom
  schedule_type text not null, -- "interval" or "time"
  interval_minutes integer,
  time_of_day time,
  days text[], -- e.g. ['mon','tue']
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table reminders enable row level security;

-- Create policy to allow users to manage their own reminders
create policy "Users can manage their reminders"
on reminders
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Enable Realtime for the reminders table
alter publication supabase_realtime add table reminders;
