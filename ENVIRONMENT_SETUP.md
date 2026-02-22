# Heritage Housing - Environment Variables Checklist

## Required for Basic Functionality

### Supabase (Cloud Database)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (not anon key)

### Email (Resend)
- [ ] `RESEND_API_KEY` - API key from resend.com
- [ ] `RESEND_FROM` - (Optional) Sender email address

## Optional Features

### SMS Reminders (Twilio)
- [ ] `TWILIO_ACCOUNT_SID` - From Twilio Console
- [ ] `TWILIO_AUTH_TOKEN` - From Twilio Console  
- [ ] `TWILIO_PHONE_NUMBER` - Your Twilio phone number (+1...)

### Scheduled Reminders (Upstash Redis)
- [ ] `UPSTASH_REDIS_REST_URL` - From Upstash Console
- [ ] `UPSTASH_REDIS_REST_TOKEN` - From Upstash Console
- [ ] `CRON_SECRET` - Secret for securing cron endpoints

## Setup Instructions

### 1. Supabase Setup
1. Go to https://supabase.com
2. Create new project
3. Go to Project Settings → API
4. Copy "URL" to `SUPABASE_URL`
5. Copy "service_role secret" to `SUPABASE_SERVICE_ROLE_KEY`
6. Create table `applications` with columns:
   - `id` (text, primary key)
   - `encrypted` (text)
   - `submitted_at` (timestamptz)

### 2. Resend Setup (Email)
1. Go to https://resend.com
2. Create API key
3. Add domain or use onboarding@resend.dev
4. Copy API key to `RESEND_API_KEY`

### 3. Twilio Setup (SMS - Optional)
1. Go to https://twilio.com
2. Buy a phone number with SMS capability
3. Copy Account SID, Auth Token, and phone number

### 4. Upstash Setup (Scheduled Reminders - Optional)
1. Go to https://upstash.com
2. Create Redis database
3. Copy REST URL and Token

## Adding to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above
3. Redeploy the project

## Testing

After setup, test by:
1. Submitting an application
2. Checking Supabase Table Editor for the saved data
3. Verifying email was sent (check Resend logs)
