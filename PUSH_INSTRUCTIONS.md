# Git remote and push to GitHub

This project is configured to use: **https://github.com/Catersi1/heritage2**

## If you need to set or change the remote

```bash
git remote set-url origin https://github.com/Catersi1/heritage2.git
git remote -v
```

## Push

```bash
git push -u origin main
```

If GitHub asks for a password, use a **Personal Access Token** (not your account password). Create one at: GitHub → Settings → Developer settings → Personal access tokens.

## Step 4: Connect to Vercel

1. Go to **https://vercel.com** and sign in
2. **Add New** → **Project**
3. **Import** your GitHub repo (the one you just pushed to)
4. Vercel will detect the app; click **Deploy**

After that, every `git push origin main` will trigger a new deploy.
