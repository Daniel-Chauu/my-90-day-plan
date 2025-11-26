-- Create table for weekly health tracking
CREATE TABLE IF NOT EXISTS public.weekly_health_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  weight NUMERIC,
  activity_level TEXT,
  body_feeling TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_health_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own health tracking"
ON public.weekly_health_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health tracking"
ON public.weekly_health_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health tracking"
ON public.weekly_health_tracking
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_health_tracking_updated_at
BEFORE UPDATE ON public.weekly_health_tracking
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_weekly_health_tracking_user_week ON public.weekly_health_tracking(user_id, week_number);