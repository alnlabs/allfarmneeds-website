-- Public browse policies call private.current_user_has_role().
-- Anonymous visitors must be able to execute it; the function is
-- security definer and returns false when auth.uid() is null.

grant execute on function private.current_user_has_role(text) to anon;

-- Keep authenticated grant explicit for clarity.
grant execute on function private.current_user_has_role(text) to authenticated;
