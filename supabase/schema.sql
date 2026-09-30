-- Esegui nel SQL Editor di Supabase, una volta.
-- Poi, in Authentication → Hooks → Before user created, collega hook_restrict_signup.

create or replace function public.hook_restrict_signup(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text := lower(event->'user'->>'email');
begin
  if email not in (
    'f.costantini1995@gmail.com',
    'francesco90campo@gmail.com'
  ) then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 403,
        'message', 'Questo indirizzo non è abilitato.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_restrict_signup(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_signup(jsonb) from authenticated, anon, public;

create table if not exists public.closings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  closing_date date not null,
  cash_cents integer not null check (cash_cents >= 0),
  electronic_cents integer not null check (electronic_cents >= 0),
  drawer_cents integer not null check (drawer_cents >= 0),
  updated_at timestamptz not null default now(),
  unique (closing_date)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  kind text not null check (
    kind in (
      'fattura',
      'merce_senza_fattura',
      'bolletta',
      'affitto',
      'f24',
      'contributi',
      'busta_paga',
      'ritenuta'
    )
  ),
  amount_cents integer not null check (amount_cents > 0),
  document_date date not null,
  payment_date date,
  invoice_number text,
  terms text not null check (terms in ('scarico', '7', '10', '15', '30')),
  created_at timestamptz not null default now(),
  check (payment_date is null or payment_date >= document_date),
  check (
    kind <> 'fattura'
    or (invoice_number is not null and length(btrim(invoice_number)) > 0)
  )
);

create index if not exists expenses_user_document_idx
  on public.expenses (user_id, document_date desc);

create index if not exists expenses_user_payment_idx
  on public.expenses (user_id, payment_date);

create or replace function public.is_shop_member()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'f.costantini1995@gmail.com',
    'francesco90campo@gmail.com'
  );
$$;

revoke execute on function public.is_shop_member() from public, anon;
grant execute on function public.is_shop_member() to authenticated;

alter table public.closings enable row level security;
alter table public.expenses enable row level security;

drop policy if exists closings_select on public.closings;
drop policy if exists closings_insert on public.closings;
drop policy if exists closings_update on public.closings;
drop policy if exists closings_delete on public.closings;
drop policy if exists expenses_select on public.expenses;
drop policy if exists expenses_insert on public.expenses;
drop policy if exists expenses_update on public.expenses;
drop policy if exists expenses_delete on public.expenses;

create policy closings_select on public.closings
  for select to authenticated
  using (public.is_shop_member());

create policy closings_insert on public.closings
  for insert to authenticated
  with check (public.is_shop_member() and user_id = (select auth.uid()));

create policy closings_update on public.closings
  for update to authenticated
  using (public.is_shop_member())
  with check (public.is_shop_member());

create policy closings_delete on public.closings
  for delete to authenticated
  using (public.is_shop_member());

create policy expenses_select on public.expenses
  for select to authenticated
  using (public.is_shop_member());

create policy expenses_insert on public.expenses
  for insert to authenticated
  with check (public.is_shop_member() and user_id = (select auth.uid()));

create policy expenses_update on public.expenses
  for update to authenticated
  using (public.is_shop_member())
  with check (public.is_shop_member());

create policy expenses_delete on public.expenses
  for delete to authenticated
  using (public.is_shop_member());

grant select, insert, update, delete on public.closings to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
