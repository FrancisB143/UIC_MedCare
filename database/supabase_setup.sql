-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    suffix VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    expiry DATE,
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medicine_requests table
CREATE TABLE IF NOT EXISTS public.medicine_requests (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT REFERENCES public.medicines(id) ON DELETE CASCADE,
    requested_by VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'nurse' CHECK (role IN ('admin', 'nurse', 'doctor')),
    branch_id BIGINT REFERENCES public.branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample branches
INSERT INTO public.branches (name, suffix, address) VALUES
('Father Selga Campus', 'Main Branch', 'Davao City'),
('UIC North Campus', 'North Branch', 'Davao City'),
('UIC South Campus', 'South Branch', 'Davao City')
ON CONFLICT DO NOTHING;

-- Insert sample medicines
INSERT INTO public.medicines (name, category, stock, expiry, branch_id) VALUES
('Paracetamol 500mg', 'Pain Relief', 100, '2027-12-31', 1),
('Ibuprofen 400mg', 'Anti-inflammatory', 75, '2027-06-30', 1),
('Amoxicillin 500mg', 'Antibiotic', 50, '2026-12-31', 1),
('Cetirizine 10mg', 'Antihistamine', 200, '2027-03-31', 1),
('Paracetamol 500mg', 'Pain Relief', 80, '2027-12-31', 2),
('Aspirin 325mg', 'Pain Relief', 60, '2026-09-30', 2),
('Loratadine 10mg', 'Antihistamine', 150, '2027-01-31', 2)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- Allow all operations for authenticated users (you can make this more restrictive)
CREATE POLICY "Allow all for authenticated users" ON public.branches
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.medicines
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.medicine_requests
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.users
    FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_branch_id ON public.medicines(branch_id);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON public.medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicine_requests_branch_id ON public.medicine_requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_medicine_requests_status ON public.medicine_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON public.users(branch_id);
