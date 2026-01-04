-- Drop and recreate the SELECT policy with explicit authentication check
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);