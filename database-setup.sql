-- Compliance Management Database Setup
-- Execute these SQL statements in your Supabase SQL Editor

-- 1. Create compliance frameworks table
CREATE TABLE compliance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create forms table for dynamic forms
CREATE TABLE form (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  compliance_id UUID NOT NULL REFERENCES compliance(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  form_schema JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE form ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for compliance table
-- Allow admin users to do everything
CREATE POLICY "Admin users can manage compliance frameworks"
  ON compliance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM view_user_profiles 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Allow all authenticated users to read compliance frameworks
CREATE POLICY "Authenticated users can view compliance frameworks"
  ON compliance
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Create RLS policies for form table
-- Allow admin users to do everything
CREATE POLICY "Admin users can manage forms"
  ON form
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM view_user_profiles 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Allow all authenticated users to read forms
CREATE POLICY "Authenticated users can view forms"
  ON form
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Create indexes for better performance
CREATE INDEX idx_form_compliance_id ON form(compliance_id);
CREATE INDEX idx_compliance_name ON compliance(name);

-- 7. Insert sample data (optional)
INSERT INTO compliance (name) VALUES 
  ('GDPR Compliance Framework'),
  ('SOX Financial Controls'),
  ('ISO 27001 Information Security');

-- Sample form for GDPR
INSERT INTO form (compliance_id, name, form_schema) 
SELECT 
  id,
  'Data Processing Assessment',
  '{
    "fields": [
      {
        "id": "data_controller",
        "label": "Data Controller Name",
        "type": "text",
        "required": true,
        "placeholder": "Enter the name of the data controller"
      },
      {
        "id": "processing_purpose",
        "label": "Purpose of Processing",
        "type": "textarea",
        "required": true,
        "placeholder": "Describe the purpose of data processing"
      },
      {
        "id": "data_categories",
        "label": "Categories of Personal Data",
        "type": "select",
        "required": true,
        "options": [
          {"value": "basic", "label": "Basic identifying information"},
          {"value": "sensitive", "label": "Sensitive personal data"},
          {"value": "financial", "label": "Financial information"},
          {"value": "health", "label": "Health data"}
        ]
      },
      {
        "id": "retention_period",
        "label": "Data Retention Period",
        "type": "text",
        "required": true,
        "placeholder": "e.g., 7 years from collection"
      },
      {
        "id": "legal_basis",
        "label": "Legal Basis for Processing",
        "type": "select",
        "required": true,
        "options": [
          {"value": "consent", "label": "Consent"},
          {"value": "contract", "label": "Contract"},
          {"value": "legal_obligation", "label": "Legal obligation"},
          {"value": "vital_interests", "label": "Vital interests"},
          {"value": "public_task", "label": "Public task"},
          {"value": "legitimate_interests", "label": "Legitimate interests"}
        ]
      }
    ]
  }'::jsonb
FROM compliance 
WHERE name = 'GDPR Compliance Framework'
LIMIT 1;
