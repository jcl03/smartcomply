-- Audit-related database setup and permissions

-- Create a view to get user profile information for audits
CREATE OR REPLACE VIEW view_audit_user_profiles AS
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name
FROM auth.users au;

-- Enable RLS on audit table
ALTER TABLE public.audit ENABLE ROW LEVEL SECURITY;

-- Create policies for audit table
-- Users can only see their own audits, unless they are admin/manager
CREATE POLICY "Users can view own audits" ON public.audit
  FOR SELECT USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM view_user_profiles 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('admin', 'manager')
    )
  );

-- Users can only insert their own audits
CREATE POLICY "Users can insert own audits" ON public.audit
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own audits (but not the result/marks/percentage - those should be set by system)
CREATE POLICY "Users can update own audits" ON public.audit
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status != 'completed'
  );

-- Only admins/managers can delete audits
CREATE POLICY "Admins can delete audits" ON public.audit
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM view_user_profiles 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role IN ('admin', 'manager')
    )
  );

-- Create an index for better performance on audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_status ON public.audit(status);
CREATE INDEX IF NOT EXISTS idx_audit_result ON public.audit(result);

-- Create a function to automatically update last_edit_at
CREATE OR REPLACE FUNCTION update_audit_last_edit_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edit_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating last_edit_at
DROP TRIGGER IF EXISTS trigger_audit_last_edit_at ON public.audit;
CREATE TRIGGER trigger_audit_last_edit_at
  BEFORE UPDATE ON public.audit
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_last_edit_at();
