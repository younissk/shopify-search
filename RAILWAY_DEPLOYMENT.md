# Railway Deployment Guide

This guide covers deploying Shopify Search to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository with your code
- Supabase project set up
- Clerk account configured

---

## Initial Setup

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select `shopify-search` repository

### 2. Configure Service

Railway will auto-detect Next.js and configure settings:

- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm start`
- **Root Directory**: `/` (or `/frontend` if needed)

If auto-detection doesn't work, manually set these in Railway dashboard.

### 3. Environment Variables

Add all required environment variables in Railway dashboard:

```bash
# Application
NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=shopify-search
```

**Important:** Use production keys for Clerk (pk_live_*, sk_live_*) and Supabase.

---

## Custom Domain Setup

### 1. Add Domain in Railway

1. Go to your project settings
2. Click "Domains"
3. Click "Add Domain"
4. Enter your domain: `shopifysearch.com`

### 2. Configure DNS

Railway will provide you with a CNAME or A record. Add these to your DNS provider:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: @ (or subdomain)
Value: [railway-provided-domain]
TTL: Auto or 3600
```

**Option B: A Record**
```
Type: A
Name: @ (or subdomain)
Value: [railway-provided-ip]
TTL: Auto or 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: shopifysearch.com
TTL: Auto or 3600
```

### 3. SSL Certificate

Railway automatically provisions SSL certificates via Let's Encrypt. This takes 5-15 minutes after DNS propagation.

Check status in Railway dashboard under "Domains".

---

## Railway Configuration File

Create `railway.toml` in project root for advanced configuration:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd frontend && npm install && npm run build"

[deploy]
startCommand = "cd frontend && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3000"
```

---

## Resource Management

### Memory Limits

For low-traffic projects, default settings (512MB) are sufficient. Monitor in Railway dashboard.

To adjust:
1. Go to project settings
2. Find "Resources"
3. Adjust memory slider

### Scaling

Railway auto-scales horizontally. For vertical scaling:
- Free plan: 512MB RAM, 1 vCPU
- Hobby plan: Up to 8GB RAM, 8 vCPU

---

## Monitoring & Logs

### View Logs

1. Go to your Railway project
2. Click "Deployments"
3. Select active deployment
4. View real-time logs

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network bandwidth
- Deployment history

Access in project dashboard.

---

## Deployment Workflow

### Automatic Deployments

Railway automatically deploys on every push to `main` branch:

1. Push code to GitHub
2. Railway detects changes
3. Builds new container
4. Deploys with zero downtime
5. Health checks ensure success

### Manual Deployments

To trigger manual deployment:

1. Go to Railway dashboard
2. Click "Deploy"
3. Select commit or branch
4. Click "Deploy"

### Rollback

To rollback to previous deployment:

1. Go to "Deployments"
2. Find previous successful deployment
3. Click "Redeploy"

---

## Health Checks

Add a health check endpoint in Next.js:

**Create `app/api/health/route.ts`:**

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
```

Configure in Railway settings:
- **Path**: `/api/health`
- **Interval**: 60 seconds
- **Timeout**: 10 seconds

---

## Build Optimization

### 1. Enable Turbopack (Next.js 15)

Already configured in `package.json`:
```json
{
  "scripts": {
    "build": "next build --turbopack"
  }
}
```

### 2. Optimize Dependencies

Remove unused packages:
```bash
npm prune --production
```

### 3. Cache Node Modules

Railway caches `node_modules` between builds. Ensure `package-lock.json` is committed.

---

## Environment-Specific Configs

### Production Checks

Ensure these are set for production:

```bash
NODE_ENV=production  # Critical!
NEXT_TELEMETRY_DISABLED=1  # Optional: disable Next.js telemetry
```

### Update Clerk URLs

In Clerk dashboard, add Railway URLs to allowed origins:
- `https://your-app.railway.app`
- `https://shopifysearch.com`

### Update Supabase URLs

In Supabase dashboard, add to "Site URL" and "Redirect URLs":
- `https://your-app.railway.app`
- `https://shopifysearch.com`

---

## Troubleshooting

### Build Failures

**Problem:** Build fails with "out of memory"
**Solution:** Increase memory limit in Railway settings

**Problem:** Build fails with dependency errors
**Solution:** Delete `node_modules` and `package-lock.json`, run `npm install` locally, commit

**Problem:** Build succeeds but app doesn't start
**Solution:** Check start command is `npm start` not `npm run dev`

### Runtime Errors

**Problem:** Environment variables not working
**Solution:** Verify they're set in Railway dashboard (not just .env.local)

**Problem:** Database connection fails
**Solution:** Check Supabase URL and keys are correct, verify IP whitelist

**Problem:** Authentication not working
**Solution:** Verify Clerk URLs are added to allowed origins

### Performance Issues

**Problem:** Slow response times
**Solution:** 
1. Check Railway metrics for resource usage
2. Optimize database queries
3. Implement caching
4. Consider upgrading plan

### SSL Certificate Issues

**Problem:** SSL not provisioning
**Solution:**
1. Verify DNS is pointing to Railway
2. Wait 15 minutes for propagation
3. Contact Railway support if still failing

---

## Cost Management

### Free Tier Limits

Railway free tier includes:
- $5 free credit per month
- Pay-as-you-go after credits
- No time limits

### Estimated Costs

For low-traffic portfolio project:
- **Free tier**: Often sufficient ($0-5/month)
- **Light usage**: $5-10/month
- **Medium traffic**: $15-30/month

Monitor usage in Railway dashboard.

### Cost Optimization

1. **Optimize build times**: Faster builds = lower costs
2. **Reduce memory usage**: Right-size your service
3. **Implement caching**: Reduce computation
4. **Use CDN**: Offload static assets (Railway includes)

---

## CI/CD Best Practices

### Branch Deployments

Create preview deployments for PRs:

1. Go to Railway settings
2. Enable "PR Deployments"
3. New deployment for each PR
4. Auto-cleanup on PR merge

### Pre-Deployment Checks

Add GitHub Actions for quality checks:

**`.github/workflows/check.yml`:**

```yaml
name: Quality Checks

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build
```

---

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use production keys**: Not test/development keys
3. **Enable 2FA**: On Railway, GitHub, Clerk, Supabase
4. **Regular updates**: Keep dependencies up-to-date
5. **Monitor logs**: Check for suspicious activity

---

## Backup Strategy

### Database Backups

Supabase handles automatic backups:
- Free tier: Daily backups, 7-day retention
- Pro tier: Daily backups, 30-day retention
- Manual backups available

### Code Backups

- GitHub repository is your backup
- Railway keeps deployment history (90 days)
- Consider additional Git remote (GitLab, Bitbucket)

---

## Support & Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Status**: [status.railway.app](https://status.railway.app)
- **Support**: support@railway.app

---

## Post-Deployment Checklist

- [ ] Domain configured and SSL active
- [ ] Environment variables set correctly
- [ ] Health check endpoint responding
- [ ] Clerk authentication working
- [ ] Supabase connection successful
- [ ] All pages loading correctly
- [ ] Search functionality working
- [ ] Images loading from CDN
- [ ] Analytics tracking (if configured)
- [ ] Error monitoring active (if configured)
- [ ] Uptime monitor configured

---

## Maintenance

### Regular Tasks

- **Weekly**: Check logs for errors
- **Monthly**: Review Railway costs
- **Quarterly**: Update dependencies
- **Annually**: Review security settings

### Updates

To update the application:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Railway auto-deploys
5. Monitor logs for issues
6. Rollback if needed

---

**You're ready to deploy! 🚀**

For questions or issues, refer to Railway documentation or contact support.

