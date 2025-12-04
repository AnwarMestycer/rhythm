# Supabase Setup Instructions

1.  **Create a Supabase Project**: Go to [database.new](https://database.new) and create a new project.
2.  **SQL Editor**: Go to the SQL Editor in your Supabase dashboard.
3.  **Run Migration**: Copy the contents of `supabase_schema.sql` and run it.
4.  **Get Credentials**:
    *   Go to **Project Settings** -> **API**.
    *   Copy the `Project URL` and `anon public` key.
    *   You will need these for the Next.js app (`.env.local`) and the Chrome Extension.
5.  **Auth Settings**:
    *   Go to **Authentication** -> **Providers**.
    *   Ensure **Email** is enabled.
    *   (Optional) Disable "Confirm email" in **Authentication** -> **URL Configuration** if you want to skip email verification for testing.
