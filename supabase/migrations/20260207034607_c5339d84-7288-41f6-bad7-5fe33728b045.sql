-- Create table to store farmer advisory requests (so admin can see what farmers are asking)
CREATE TABLE public.farmer_advisory_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location TEXT,
  soil_type TEXT,
  season TEXT,
  land_size NUMERIC,
  current_crop TEXT,
  query TEXT,
  ai_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmer_advisory_requests ENABLE ROW LEVEL SECURITY;

-- Farmers can insert and view their own requests
CREATE POLICY "Farmers can create advisory requests"
  ON public.farmer_advisory_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can view their own advisory requests"
  ON public.farmer_advisory_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all advisory requests
CREATE POLICY "Admins can view all advisory requests"
  ON public.farmer_advisory_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create table for dose calculations
CREATE TABLE public.dose_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  land_area NUMERIC NOT NULL,
  soil_type TEXT,
  fertilizer_type TEXT NOT NULL,
  calculated_dose NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dose_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage their dose calculations"
  ON public.dose_calculations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all dose calculations"
  ON public.dose_calculations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create table for water planning
CREATE TABLE public.water_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop_name TEXT NOT NULL,
  land_area NUMERIC NOT NULL,
  soil_type TEXT,
  irrigation_type TEXT,
  water_schedule JSONB,
  total_water_requirement NUMERIC,
  unit TEXT DEFAULT 'liters',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.water_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage their water plans"
  ON public.water_plans FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all water plans"
  ON public.water_plans FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create table for crop comparisons
CREATE TABLE public.crop_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crops_compared TEXT[] NOT NULL,
  location TEXT,
  season TEXT,
  comparison_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage their crop comparisons"
  ON public.crop_comparisons FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all crop comparisons"
  ON public.crop_comparisons FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create table for emergency help requests
CREATE TABLE public.emergency_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emergency_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending',
  admin_response TEXT,
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can create emergency requests"
  ON public.emergency_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can view their emergency requests"
  ON public.emergency_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all emergency requests"
  ON public.emergency_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add is_verified and is_active columns to profiles for admin user management
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;