-- Add sample users to your Supabase users table
-- Make sure to use actual Gmail addresses that you want to test with
-- Your table structure: user_id (PK), email, name, branch_id

INSERT INTO public.users (email, name, branch_id) VALUES
-- Branch 1 (Father Selga Campus) users
('nurse1@gmail.com', 'Maria Santos', 1),
('doctor1@gmail.com', 'Dr. Juan Dela Cruz', 1),
('admin@gmail.com', 'System Administrator', 1),

-- Branch 2 (UIC North Campus) users
('nurse2@gmail.com', 'Anna Reyes', 2),
('doctor2@gmail.com', 'Dr. Pedro Garcia', 2),

-- Branch 3 (UIC South Campus) users
('nurse3@gmail.com', 'Carmen Lopez', 3),
('doctor3@gmail.com', 'Dr. Jose Rizal', 3)

ON CONFLICT (email) DO NOTHING;

-- Update with your actual Gmail addresses for testing
-- Example:
-- UPDATE public.users SET email = 'your.actual.email@gmail.com' WHERE email = 'nurse1@gmail.com';

-- To check the users and their branches:
-- SELECT u.*, b.name as branch_name, b.suffix as branch_suffix 
-- FROM public.users u 
-- JOIN public.branches b ON u.branch_id = b.id;
