# Connect member accounts and saved progress

The website is prepared for Supabase Auth and a Supabase Postgres database. Follow these steps to turn it on.

## 1. Create a Supabase project

1. Go to [Supabase](https://supabase.com/) and create an account.
2. Select **New project**.
3. Give it a name such as `movie-your-english` and choose a strong database password.
4. Choose a region close to your learners and create the project.

## 2. Create the progress table securely

1. In the Supabase dashboard, open **SQL Editor**.
2. Choose **New query**.
3. Copy everything from [`supabase/schema.sql`](supabase/schema.sql) into the editor.
4. Click **Run**.

This creates `lesson_progress` and row-level security rules. Each signed-in member can only read or change their own progress.

## 3. Configure magic-link sign-in

1. Go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to:

   `https://movieyourenglish.vercel.app`

3. Add this to **Redirect URLs**:

   `https://movieyourenglish.vercel.app/**`

Supabase sends the learner an email link; following it returns them to the same activity page already signed in.

## 4. Get the two public browser values

1. Go to **Project Settings** → **API**.
2. Copy the **Project URL**.
3. Copy the **Publishable key**. If the dashboard shows only legacy keys, copy the **anon public** key.

These two values are safe to use in browser code only because the database row-level security policies are enabled. Never copy or share the `service_role` key.

## 5. Send the values to Codex

Send:

- Project URL
- Publishable key (or anon public key)

Codex will place them in `auth-config.js`, push the update, and then verify sign-in and progress saving on the live site.
