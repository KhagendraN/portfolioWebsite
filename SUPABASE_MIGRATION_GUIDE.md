# Supabase Migration Guide

## 1. Supabase Setup

1.  **Create Account**: Go to [supabase.com](https://supabase.com) and sign up.
2.  **Create Project**: Create a new project.
3.  **Get Credentials**:
    *   Go to **Project Settings** -> **API**.
    *   Copy `Project URL`.
    *   Copy `anon public` key.
    *   Copy `service_role` key (keep this secret! only for migration script).

## 2. Database Setup

1.  Go to the **SQL Editor** in your Supabase dashboard.
2.  Open the file `supabase/migrations/001_create_blog_schema.sql` from this repository.
3.  Copy the content and paste it into the SQL Editor.
4.  Click **Run**.

## 3. Configure Local Environment

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Edit `.env` and fill in your Supabase credentials.

## 4. Run Migration Script

This script will move your existing Markdown blog posts to the Supabase database.

```bash
# Install dependencies (if not already done)
npm install

# Run migration
node scripts/migrate-to-supabase.js
```

## 5. Frontend Configuration

1.  Open `js/supabase-config.js`.
2.  Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual values.
    *   *Note: For a production app, it's better to inject these via build process or keep them in a config file that isn't public, but for a static site on GitHub Pages, exposing the anon key is standard practice as long as RLS policies are set correctly.*

## 6. Verify

## 7. Post-Migration: Claim Ownership

**Important**: Posts migrated from Markdown files will not have an owner assigned initially. This means you won't be able to edit or delete them until you "claim" them.

1.  Go to **Authentication** -> **Users** in Supabase and copy your **User UID**.
2.  Go to the **SQL Editor**.
3.  Run the following command (replace `YOUR_USER_UID` with the ID you copied):

```sql
UPDATE blog_posts
SET author_id = 'YOUR_USER_UID'
WHERE author_id IS NULL;
```

Now you have full control over all posts!
