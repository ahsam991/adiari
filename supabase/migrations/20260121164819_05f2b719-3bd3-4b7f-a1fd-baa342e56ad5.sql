-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.orders;
  new_number := 'FC' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(counter::TEXT, 5, '0');
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix permissive RLS policy on email_logs for INSERT
-- System inserts should be handled via service role or edge functions
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;

-- Create a more restrictive policy - only authenticated users can insert
-- (the edge function using service role will bypass RLS anyway)
CREATE POLICY "Service can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');