# Deployment Guide

## Prerequisites
- Node.js 20+
- npm 10+
- Supabase account (free tier)
- Vercel account (free tier)
- Anthropic API key (for Claude API)

## Local Development

```bash
# Clone and install
cd aivihe
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Start Supabase local (optional)
npx supabase start

# Run migrations
npx supabase db push

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon/public key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (server only) | Yes |
| ANTHROPIC_API_KEY | Claude API key | Yes |
| NEXT_PUBLIC_APP_URL | App URL (http://localhost:3000 for dev) | Yes |

## Production Deployment (Vercel)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (auto-builds on push)

## Supabase Cloud Setup

1. Create project (region: Singapore)
2. Run migrations via Supabase CLI or dashboard
3. Enable Phone Auth provider
4. Create Storage bucket "documents"
5. Apply RLS policies
6. Run seed data for demo
