-- Sample audit data for testing

-- Note: This is sample data for testing. 
-- Make sure to replace user_id values with actual user IDs from your auth.users table
-- and form_id values with actual form IDs from your form table

-- Sample audits (replace UUIDs and form_ids with actual values)
INSERT INTO public.audit (
  form_id, 
  user_id, 
  status, 
  result, 
  marks, 
  percentage, 
  title, 
  comments,
  audit_data,
  created_at,
  last_edit_at
) VALUES 
-- Replace these UUIDs with actual user IDs from your database
(
  1, -- Ensure this form_id exists in your form table
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user UUID
  'completed',
  'pass',
  85,
  85.00,
  'Security Compliance Audit - Q4 2024',
  'All security protocols are functioning correctly. Minor recommendations for improvement.',
  '{"responses": {"q1": "Yes", "q2": "Implemented", "q3": "90%", "q4": "All staff trained"}, "completion_time": 1800}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  1, -- Ensure this form_id exists in your form table
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user UUID
  'completed',
  'failed',
  45,
  45.00,
  'Data Protection Audit - Q3 2024',
  'Several critical issues found. Immediate action required on data encryption and access controls.',
  '{"responses": {"q1": "No", "q2": "Partial", "q3": "60%", "q4": "Needs training"}, "completion_time": 2400}',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
),
(
  1, -- Ensure this form_id exists in your form table
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user UUID
  'draft',
  NULL,
  0,
  0.00,
  'Network Security Assessment - In Progress',
  'Audit in progress. Scheduled for completion by end of week.',
  '{"responses": {"q1": "Yes"}, "completion_time": 0}',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
);

-- Update the UUIDs and form_ids above with actual values from your database before running this script.
-- You can find user IDs with: SELECT id, email FROM auth.users;
-- You can find form IDs with: SELECT id, compliance_id FROM form;
