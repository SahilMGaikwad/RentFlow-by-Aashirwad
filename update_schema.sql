-- Run this in your Supabase SQL Editor to update the tables for the new features

-- 1. Add phone to residents
ALTER TABLE residents
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Add payment_date to payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
