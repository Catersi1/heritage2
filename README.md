<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/845850bc-429a-417a-88ba-5a9a06f6f45b

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Set `GEMINI_API_KEY` in `.env.local` for AI features.
3. Run the app:
   ```bash
   npm run dev
   ```

## See customer applications in the dashboard

**By default, applications are stored only in the submitter’s browser.** If someone fills out the form on your live site (e.g. heritage2.vercel.app), you will **not** see it in your dashboard unless you enable cloud storage.

To collect all submissions in one place:

1. Create a project at [Supabase](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor** and run:
   ```sql
   create table if not exists applications (
     id text primary key,
     data jsonb not null,
     status text not null default 'Pending',
     applicant_name text,
     applicant_phone text,
     submitted_at timestamptz
   );
   -- Allow anonymous read/write for the anon key (or add RLS policies as needed):
   alter table applications enable row level security;
   create policy "Allow anon insert" on applications for insert to anon with check (true);
   create policy "Allow anon select" on applications for select to anon using (true);
   create policy "Allow anon update" on applications for update to anon using (true);
   create policy "Allow anon delete" on applications for delete to anon using (true);
   ```
3. Copy your project URL and anon key from Supabase **Settings → API**.
4. In your **deployment** (e.g. Vercel), add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Redeploy so the live site uses these variables. New submissions will then be saved to Supabase and will appear in the Employee Dashboard when you click **Refresh**.
