-- ==========================================
-- Apartment Maintenance Management System
-- Supabase SQL Setup Script
-- ==========================================

-- 1. Create Residents Table
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    flat_no TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    amount INTEGER NOT NULL,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    payment_date TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on both tables
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for Residents Table (Public Access for Development)
CREATE POLICY "allow_select" ON residents FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON residents FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON residents FOR UPDATE USING (true);
CREATE POLICY "allow_delete" ON residents FOR DELETE USING (true);

-- Policies for Payments Table (Public Access for Development)
CREATE POLICY "allow_select" ON payments FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON payments FOR UPDATE USING (true);
CREATE POLICY "allow_delete" ON payments FOR DELETE USING (true);

-- Optional: Create an index for faster querying by resident_id on payments
CREATE INDEX IF NOT EXISTS idx_payments_resident_id ON payments(resident_id);
