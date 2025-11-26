-- Add email notification settings to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_email text,
ADD COLUMN IF NOT EXISTS notification_time time DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS last_email_sent_date date;

-- Add index for cron job performance
CREATE INDEX IF NOT EXISTS idx_profiles_notifications 
ON public.profiles(email_notifications_enabled, notification_time) 
WHERE email_notifications_enabled = true;