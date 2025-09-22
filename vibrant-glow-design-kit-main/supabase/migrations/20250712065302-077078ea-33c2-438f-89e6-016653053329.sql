-- Create security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update profiles RLS policies to prevent role modification by regular users
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Allow users to update their own profile EXCEPT the role field
CREATE POLICY "Users can update own profile except role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    OLD.role = NEW.role 
    OR public.get_current_user_role() = 'admin'
  )
);

-- Allow admins to update any profile including roles
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');