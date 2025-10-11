# Environment Variables Setup

This document describes all environment variables needed to run Shopify Search.

## Setup Instructions

1. Create a `.env.local` file in the `frontend` directory
2. Copy the variables below and fill in your actual values
3. **Never commit `.env.local` or any file containing actual secrets**
4. For production (Railway), set these as environment variables in the Railway dashboard

---

## Required Variables

### Application

```bash
# Base URL for your deployed application (used in sitemap, robots.txt, etc.)
NEXT_PUBLIC_BASE_URL=https://shopifysearch.com

# Node environment (development, production, test)
NODE_ENV=development
```

### Supabase Configuration

Get these from your Supabase project settings: https://app.supabase.com/project/YOUR_PROJECT/settings/api

```bash
# Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous public key (safe to expose in frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Clerk Authentication

Get these from your Clerk dashboard: https://dashboard.clerk.com/

```bash
# Clerk publishable key (safe to expose in frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Clerk secret key (KEEP SECRET - server-side only)
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Clerk sign-in URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# Clerk sign-up URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## Optional Variables

### Analytics

Choose one or more analytics services:

#### Plausible Analytics (Recommended - Privacy-friendly)

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=shopifysearch.com
```

#### Vercel Analytics

Automatically enabled on Vercel deployments. No configuration needed.

#### Google Analytics 4

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Error Monitoring

#### Sentry (Recommended)

```bash
# Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Sentry Organization
SENTRY_ORG=your-org

# Sentry Project
SENTRY_PROJECT=shopify-search

# Sentry Auth Token (for source maps)
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## Railway Configuration (Production)

These are automatically set by Railway. **Do not configure manually:**

```bash
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_ID=xxx
RAILWAY_SERVICE_ID=xxx
```

---

## Development

```bash
# Port for local development (default: 3000)
PORT=3000
```

---

## Example .env.local File

Create `frontend/.env.local` with:

```bash
# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## Important Notes

1. **Security**: Never commit `.env.local` or share secret keys
2. **Restart Required**: Restart your dev server after changing environment variables
3. **Production**: Set variables in Railway dashboard, not in files
4. **Public Variables**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
5. **Secret Keys**: Variables without `NEXT_PUBLIC_` are server-side only

---

## Troubleshooting

### "Missing environment variables" error

- Ensure all required variables are set in `.env.local`
- Restart your development server
- Check for typos in variable names

### Authentication not working

- Verify Clerk keys are correct
- Ensure URLs match your actual deployment
- Check Clerk dashboard for configuration issues

### Database connection errors

- Verify Supabase URL and anon key
- Check Supabase project status
- Ensure database migrations are applied

---

For more information, see the setup guides:
- [CLERK_SETUP.md](../CLERK_SETUP.md)
- [COLLECTIONS_SETUP.md](../COLLECTIONS_SETUP.md)

