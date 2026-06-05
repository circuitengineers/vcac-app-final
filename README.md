# 🍁 VCAC — Vibe Coders Association of Canada

## Deploy in 5 steps (no coding knowledge needed!)

---

### STEP 1 — Set up your database (5 minutes)

1. Go to supabase.com → sign in → open your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `SUPABASE_SETUP.sql` from this folder
5. Copy ALL the text and paste it into the SQL editor
6. Click **Run** (green button)
7. You should see "Success" — your database is ready!

Then set yourself as President:
- In the same SQL editor, run this (replace with YOUR email):
  ```sql
  UPDATE profiles SET role = 'president' WHERE email = 'YOUR_EMAIL@gmail.com';
  ```
  (Run this AFTER you first sign up on the website)

---

### STEP 2 — Enable Google login (optional, 5 minutes)

1. In Supabase → **Authentication** → **Providers** → **Google**
2. Toggle it on
3. Follow the instructions to get a Google Client ID and Secret
4. Paste them in and save
5. Add this to the redirect URLs: `https://YOUR-SITE.vercel.app/auth/callback`

---

### STEP 3 — Install Node.js (one time, 2 minutes)

1. Go to nodejs.org
2. Download the "LTS" version (big green button)
3. Install it (just click Next, Next, Finish)

---

### STEP 4 — Deploy to Vercel (10 minutes)

1. Go to github.com → click **+** → **New repository**
2. Name it `vcac` → click **Create repository**
3. Open Terminal (Mac) or Command Prompt (Windows)
4. Run these commands one at a time:

```bash
cd Desktop
npx create-next-app@14.2.3 vcac-upload --use-npm --no-typescript --no-tailwind --no-eslint --no-app --no-src-dir
```

5. Copy ALL the files from this folder into the `vcac-upload` folder (replace everything)
6. Then run:
```bash
cd vcac-upload
npm install
```

7. Go to vercel.com → **Add New Project** → **Import** your GitHub repo
8. In Vercel's **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://bysmwujtlcdrctupsxkx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
9. Click **Deploy** — Vercel builds and publishes your site!

---

### STEP 5 — You're live! 🎉

Your website is now at `https://vcac.vercel.app` (or whatever Vercel gives you).

Share it everywhere:
- Reddit: r/webdev, r/ChatGPT, r/programming, r/canada
- Twitter/X: tag #vibecoding #canada
- Discord servers for AI/coding

---

## How to manage your site day-to-day

- Sign up on your own website with your email
- Run the President SQL command (Step 1) with your email
- Go to `yoursite.com/admin` — you'll see the admin panel
- Approve/reject project submissions
- Feature your favourite projects
- Promote members to Pro

## Pages

| Page | What it does |
|------|-------------|
| `/` | Homepage with hero + project gallery |
| `/projects` | Browse all projects |
| `/projects/[id]` | Run a project live + comments |
| `/submit` | Submit a new project |
| `/profile` | Your profile + your projects |
| `/leaderboard` | Top projects + top builders |
| `/admin` | President-only control panel |
| `/login` | Sign in / Sign up |

---

Built with 🍁 and Claude.
