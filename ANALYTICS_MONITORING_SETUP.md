# Analytics & Monitoring Setup Guide

This guide covers setting up analytics and error monitoring for Shopify Search in production.

## Table of Contents

- [Privacy-Friendly Analytics](#privacy-friendly-analytics)
- [Error Monitoring with Sentry](#error-monitoring-with-sentry)
- [Uptime Monitoring](#uptime-monitoring)
- [Performance Monitoring](#performance-monitoring)

---

## Privacy-Friendly Analytics

We recommend privacy-friendly analytics that don't require cookie consent for GDPR compliance.

### Option 1: Plausible Analytics (Recommended)

**Why Plausible:**
- No cookies, fully GDPR compliant
- Lightweight script (<1KB)
- Beautiful, simple dashboard
- Free for <10k monthly pageviews

**Setup:**

1. Sign up at [plausible.io](https://plausible.io)
2. Add your domain: `shopifysearch.com`
3. Add environment variable:
   ```bash
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=shopifysearch.com
   ```

4. Add script to `app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          {process.env.NODE_ENV === 'production' && (
            <script
              defer
              data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              src="https://plausible.io/js/script.js"
            />
          )}
          {/* ... existing head content ... */}
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

5. (Optional) Track custom events:

```tsx
// Track search queries
window.plausible?.('Search', { props: { query: searchQuery } });

// Track product views
window.plausible?.('Product View', { props: { domain: productDomain } });
```

**Cost:** Free up to 10k/month, then $9/month

---

### Option 2: Vercel Analytics

**Why Vercel:**
- Zero configuration if deploying to Vercel
- Privacy-friendly
- Free tier available
- Includes Web Vitals tracking

**Setup:**

1. Install package:
   ```bash
   npm install @vercel/analytics
   ```

2. Add to `app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

3. Deploy to Vercel - analytics work automatically!

**Cost:** Free on all plans

---

### Option 3: Google Analytics 4

**Why GA4:**
- Most popular analytics platform
- Advanced segmentation and reporting
- Free forever
- Requires cookie consent banner for GDPR

**Setup:**

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add environment variable:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. Install package:
   ```bash
   npm install @next/third-parties
   ```

5. Add to `app/layout.tsx`:
   ```tsx
   import { GoogleAnalytics } from '@next/third-parties/google';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           {process.env.NODE_ENV === 'production' && (
             <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
           )}
         </body>
       </html>
     );
   }
   ```

6. **Important:** Add cookie consent banner for GDPR compliance

**Cost:** Free

---

## Error Monitoring with Sentry

Sentry captures errors, performance issues, and provides detailed debugging information.

### Setup

1. **Create Sentry account** at [sentry.io](https://sentry.io)

2. **Create a new Next.js project** in Sentry dashboard

3. **Install Sentry packages:**
   ```bash
   npm install @sentry/nextjs
   ```

4. **Initialize Sentry:**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

5. **Add environment variables:**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_AUTH_TOKEN=your-auth-token
   SENTRY_ORG=your-org
   SENTRY_PROJECT=shopify-search
   ```

6. **Configure Sentry** (`sentry.client.config.ts`):
   ```ts
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1, // 10% of requests
     environment: process.env.NODE_ENV,
     enabled: process.env.NODE_ENV === 'production',
   });
   ```

7. **Server configuration** (`sentry.server.config.ts`):
   ```ts
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1,
     environment: process.env.NODE_ENV,
     enabled: process.env.NODE_ENV === 'production',
   });
   ```

8. **Test error tracking:**
   ```tsx
   // Trigger a test error
   throw new Error("Sentry test error");
   ```

### Advanced Features

**Capture custom errors:**
```ts
import * as Sentry from "@sentry/nextjs";

try {
  await searchProducts(query);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'search' },
    extra: { query }
  });
}
```

**Set user context:**
```ts
Sentry.setUser({
  id: userId,
  email: userEmail
});
```

**Breadcrumbs:**
```ts
Sentry.addBreadcrumb({
  message: 'User searched for products',
  data: { query },
  level: 'info'
});
```

### Railway Integration

Add Sentry integration in Railway dashboard to link deployments with releases:

1. Go to Railway project settings
2. Add Sentry integration
3. Authorize Railway in Sentry
4. Deployments will now appear in Sentry releases

**Cost:** Free up to 5,000 errors/month, then $26/month

---

## Uptime Monitoring

Monitor your site's availability and get alerts when it goes down.

### Option 1: UptimeRobot (Recommended)

**Why UptimeRobot:**
- Free plan: 50 monitors
- 5-minute check interval
- Multiple alert channels (email, SMS, Slack)
- Status page generation

**Setup:**

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Create a new HTTP(s) monitor
3. URL: `https://shopifysearch.com`
4. Check interval: 5 minutes
5. Add alert contacts (email)

**Optional:** Create a public status page to show uptime to users

**Cost:** Free (up to 50 monitors)

---

### Option 2: Better Uptime

**Why Better Uptime:**
- Beautiful status pages
- Incident management
- More alert options
- Better dashboard

**Setup:**

1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Add monitor for `https://shopifysearch.com`
3. Set up on-call schedule
4. Configure alert channels

**Cost:** Free for 1 monitor, then $18/month

---

## Performance Monitoring

### Next.js Built-in Analytics

Next.js includes built-in performance monitoring:

1. Add to `next.config.ts`:
   ```ts
   const nextConfig = {
     experimental: {
       instrumentationHook: true,
     },
   };
   ```

2. Create `instrumentation.ts` in root:
   ```ts
   export async function register() {
     if (process.env.NEXT_RUNTIME === 'nodejs') {
       // Server-side performance monitoring
       console.log('Performance monitoring initialized');
     }
   }
   ```

### Web Vitals

Already implemented in the project! See `frontend/lib/monitoring.ts` for the custom performance monitor.

To send Web Vitals to an analytics service:

```tsx
// app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric);
    
    // Or send to your analytics service
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
      });
    }
  });
  
  return null;
}
```

---

## Recommended Setup for Portfolio Project

For a portfolio project with low traffic, we recommend:

1. **Analytics:** Plausible (free, privacy-friendly)
2. **Error Monitoring:** Sentry (free tier, 5k errors/month)
3. **Uptime:** UptimeRobot (free, 50 monitors)

**Total monthly cost:** $0 for low traffic

---

## Dashboard Overview

After setup, you'll have access to:

- **Plausible:** Pageviews, unique visitors, bounce rate, top pages
- **Sentry:** Error rates, stack traces, user impact, performance metrics
- **UptimeRobot:** Uptime percentage, response times, downtime alerts

---

## Testing in Development

To test integrations locally:

```bash
# Set NODE_ENV to production temporarily
NODE_ENV=production npm run dev

# Or use production build
npm run build
npm start
```

Remember to set `enabled: process.env.NODE_ENV === 'production'` in configs to avoid polluting production data with dev traffic.

---

## Privacy Considerations

- **Plausible/Vercel Analytics:** No cookies, fully GDPR compliant
- **Google Analytics:** Requires cookie consent banner
- **Sentry:** Anonymize PII, don't log sensitive data
- **All services:** Add to Privacy Policy

---

## Next Steps

1. Choose analytics provider (Plausible recommended)
2. Set up Sentry for error monitoring
3. Configure UptimeRobot for availability monitoring
4. Update Privacy Policy with chosen services
5. Test all integrations in production
6. Set up alerts and notification channels

---

For questions or issues, refer to official documentation:
- [Plausible Docs](https://plausible.io/docs)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [UptimeRobot Docs](https://uptimerobot.com/api/)

