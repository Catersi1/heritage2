# API (Vercel Serverless)

## Email: `sendConfirmation.js`

Sends a confirmation email when an application is fully submitted.

**Vercel env:**
- `RESEND_API_KEY` – from [Resend](https://resend.com)
- `RESEND_FROM` (optional) – e.g. `Heritage Housing <noreply@yourdomain.com>`

---

## SMS: `sendAppointmentReminder.js`

Sends a reminder text to the customer when they set an appointment date (either “Save appointment date” only or full submit with a date).

**Vercel env (Twilio):**
- `TWILIO_ACCOUNT_SID` – from [Twilio Console](https://console.twilio.com)
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER` – your Twilio number in E.164 (e.g. `+14055551234`)

**Setup:**
1. Sign up at [twilio.com](https://www.twilio.com) and get a phone number with SMS.
2. In Vercel → Project → Settings → Environment Variables, add the three variables above.
3. Redeploy. If any Twilio env is missing, the API skips sending and returns `200` with `skipped: 'no Twilio config'` so the rest of the flow still works.

**1-day and 2-day reminders:** When a customer sets an appointment, the app also calls `registerAppointmentReminder.js` to store it in Upstash Redis. A daily cron (`sendUpcomingReminders.js`, 9 AM Central) sends SMS 2 days before and 1 day before. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (from [Upstash](https://console.upstash.com)). Optional: `CRON_SECRET` to secure the cron endpoint.

The message sent is:  
*“Hi [First Name], your appointment with Heritage Housing is set for [date]. We'll confirm before then. Questions? Call 405-601-5650.”*
