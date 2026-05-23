-- Run in Supabase SQL Editor to enable Profile "حذف الحساب نهائياً".
-- Deletes app data for the signed-in user. Removing auth.users requires a
-- separate Edge Function with the service role (not possible from the anon client).

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.analyses where user_id = auth.uid();
  delete from public.profiles where id = auth.uid();
end;
$$;

revoke all on function public.delete_user_account() from public;
grant execute on function public.delete_user_account() to authenticated;
