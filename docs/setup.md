# Rhythm - Setup Instructions

## Prerequisites
- Node.js 18+
- Supabase Account
- Chrome Browser

## 1. Supabase Setup
1.  Create a project at [supabase.com](https://supabase.com).
2.  Run the SQL migration from `supabase_schema.sql` in the Supabase SQL Editor.
3.  Get your **Project URL** and **Anon Key** from Project Settings > API.

## 2. Web App Setup
1.  Navigate to `/web`.
2.  Create `.env.local` file:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) and sign up/login.

## 3. Chrome Extension Setup
1.  Open `extension/service_worker.js` and `extension/popup.js`.
2.  Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual credentials.
3.  Open Chrome and go to `chrome://extensions`.
4.  Enable **Developer mode** (top right).
5.  Click **Load unpacked**.
6.  Select the `/extension` folder in this project.
7.  The Rhythm extension should appear.

## 4. Testing
1.  **Web**: Create a reminder in the dashboard (e.g., "Drink Water", Interval: 1 min).
2.  **Extension**: Open the extension popup. You should see the reminder listed.
3.  **Notification**: Wait 1 minute. You should receive a Chrome notification.
4.  **Sync**: Delete the reminder in the Web App. It should disappear from the Extension popup immediately (or upon reopen).

## Troubleshooting
- **Auth**: If login fails in extension, ensure you are using the correct credentials. For this MVP, you might need to log in via the Web App first if using cookie sharing, but the current implementation uses a simple prompt or requires manual token handling. The simplest way is to use the Web App to manage reminders and the Extension just to view/notify.
- **Notifications**: Ensure Chrome notifications are enabled for the extension.
