-- Create meal_suggestions table to store generated meal plans
CREATE TABLE public.meal_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  suggestions jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure one suggestion per user per day
  UNIQUE(user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.meal_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own meal suggestions"
  ON public.meal_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal suggestions"
  ON public.meal_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal suggestions"
  ON public.meal_suggestions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal suggestions"
  ON public.meal_suggestions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_meal_suggestions_updated_at
  BEFORE UPDATE ON public.meal_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_meal_suggestions_user_day ON public.meal_suggestions(user_id, day_number);