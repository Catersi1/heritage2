# Supabase setup (applications stored in the cloud)

Applications are synced to Supabase so the **Sales Dashboard** shows the same data from any browser or device.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up or log in.
2. **New project** → choose org, name (e.g. `heritage-housing`), database password, region.
3. Wait for the project to be ready.

## 2. Create the table

In the Supabase dashboard: **SQL Editor** → **New query**. Run:

```sql
create table if not exists applications (
  id            text primary key,
  encrypted     text not null,
  submitted_at  timestamptz not null
);

-- Optional: allow RLS but permit service role to do everything (default)
alter table applications enable row level security;

create policy "Service role full access"
  on applications
  for all
  to service_role
  using (true)
  with check (true);
```

Run the query. The `applications` table is used by the API to store encrypted application payloads (the app encrypts data before sending).

## 3. Get your Project URL and service_role key

You need two values: **Project URL** and **service_role** key.

### Option A – Connect dialog (easiest)

1. In the Supabase dashboard, open your **project** (click its name if you have more than one).
2. In the **left sidebar**, click **“Connect”** (or the link that says “Connect to your project” / “Project API”).
3. In the dialog that opens you’ll see:
   - **Project URL** – copy this (e.g. `https://abcdefgh.supabase.co`).
   - **API Keys** – open the section that shows **“service_role”** or **“Secret”**. Copy that key (the long one marked secret; do **not** use the “anon” or “publishable” key).

### Option B – Project Settings → API

1. In the Supabase dashboard, open your **project** (click the project name).
2. In the **left sidebar**, scroll to the bottom and click the **gear icon** (**Project Settings**).
3. In the settings menu on the left, click **“API”** (or **“API Keys”**).
4. On that page you’ll see:
   - **Project URL** at the top – copy it.
   - **Project API keys** – if you see a **“Legacy API Keys”** or **“API Keys”** section, find the key labeled **“service_role”** (or **“Secret”**). Click **Reveal** / **Copy** and copy that key. Use the **service_role** (or secret) key only; do **not** use the “anon” or “publishable” key.

If you don’t see “API” or “API Keys”, make sure you’re inside a project (not on the organization overview) and that you’re in **Project Settings** (gear at bottom of the left sidebar).

**Note:** Supabase may show “Legacy API Keys” (with `anon` and `service_role`) or newer “Publishable” and “Secret” keys. For our server API use either the **service_role** key (legacy) or a **Secret** key; both work. Do not use the anon or publishable key.

## 4. Add env vars in Vercel

In **Vercel** → your project → **Settings** → **Environment Variables**:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | Your Project URL (e.g. `https://xxxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | The **service_role** secret key |

Redeploy the project so the API routes see the new variables.

## 5. How it works

- **Dashboard load:** The app calls `GET /api/getApplications`. The API reads from Supabase and returns encrypted rows. The client decrypts them and shows the list. Results are also cached in the browser’s IndexedDB.
- **Save (submit or draft):** The app encrypts the application, saves to IndexedDB, then sends the encrypted payload to `POST /api/saveApplication`, which upserts into Supabase.
- **Delete:** The app deletes from IndexedDB and calls `GET /api/deleteApplication?id=...`, which deletes the row in Supabase.

If Supabase is not configured, the API returns an error and the app falls back to **local-only** behavior (IndexedDB only), so the app still works without cloud.
