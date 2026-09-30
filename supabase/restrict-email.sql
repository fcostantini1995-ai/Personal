-- Authentication → Hooks → Before user created
-- Seleziona questa funzione. Così anche una chiamata diretta all'API
-- rifiuta qualsiasi indirizzo diverso da quello configurato.

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
