# Rhythm

A productivity tool combining a Next.js web application with a Chrome extension to help you manage reminders and stay on track throughout your day.

## 🎯 Overview

Rhythm consists of two integrated components:
- **Web App**: A Next.js dashboard for managing reminders and tracking your productivity
- **Chrome Extension**: A browser extension that displays reminders and sends notifications

## 📁 Project Structure

```
rhythm/
├── web/                    # Next.js web application
│   ├── src/               # Source code
│   └── package.json       # Web app dependencies
├── extension/             # Chrome extension
│   ├── manifest.json      # Extension configuration
│   ├── service_worker.js  # Background service worker
│   ├── popup.html/js/css  # Extension popup UI
│   └── content.js         # Content script
├── docs/                  # Documentation
│   ├── setup.md          # Detailed setup instructions
│   └── supabase_setup.md # Database setup guide
└── supabase_schema.sql   # Database schema
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase Account
- Chrome Browser

### Setup

1. **Database Setup**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL migration from `supabase_schema.sql`
   - Get your Project URL and Anon Key from Project Settings > API

2. **Web App**
   ```bash
   cd web
   npm install
   
   # Create .env.local with:
   # NEXT_PUBLIC_SUPABASE_URL=your_project_url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Chrome Extension**
   - Update Supabase credentials in `extension/service_worker.js` and `extension/popup.js`
   - Open Chrome and navigate to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked" and select the `extension/` folder

For detailed setup instructions, see [docs/setup.md](docs/setup.md).

## 🛠️ Tech Stack

### Web App
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

### Chrome Extension
- Manifest V3
- Vanilla JavaScript
- Supabase Client

## 📖 Documentation

- [Setup Guide](docs/setup.md) - Complete setup instructions
- [Supabase Setup](docs/supabase_setup.md) - Database configuration
- [Web App README](web/README.md) - Next.js specific documentation

## 🤝 Contributing

This is a personal productivity project. Feel free to fork and customize for your own needs!

## 📝 License

MIT
