# Quick Analytics Setup (5 Minutes)

The fastest way to get analytics running on Shopify Search.

## Option 1: Vercel Analytics (Easiest)

**Time:** 2 minutes | **Cost:** Free

### Steps

1. **Install package:**
   ```bash
   cd frontend
   npm install @vercel/analytics
   ```

2. **Update `app/layout.tsx`:**
   ```tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body>
             <AppShell>{children}</AppShell>
             <Analytics />
           </body>
         </html>
       </ClerkProvider>
     );
   }
   ```

3. **Deploy** - Analytics automatically work on Vercel!

**✓ Done!** View analytics in your Vercel dashboard.

---

## Option 2: Plausible (Most Privacy-Friendly)

**Time:** 5 minutes | **Cost:** Free (<10k pageviews/month)

### Steps

1. **Sign up** at [plausible.io](https://plausible.io)

2. **Add your domain:** `shopifysearch.com`

3. **Add environment variable** to Railway:
   ```bash
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=shopifysearch.com
   ```

4. **Update `app/layout.tsx`:**
   ```tsx
   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <head>
             {process.env.NODE_ENV === 'production' && (
               <script
                 defer
                 data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
                 src="https://plausible.io/js/script.js"
               />
             )}
             {/* existing head content */}
           </head>
           <body>
             <AppShell>{children}</AppShell>
           </body>
         </html>
       </ClerkProvider>
     );
   }
   ```

5. **Deploy** and wait 24 hours for first data

**✓ Done!** View analytics at plausible.io

### Track Custom Events (Optional)

Add this to your search component:

```tsx
// Track search queries
useEffect(() => {
  if (query && window.plausible) {
    window.plausible('search', { props: { query } });
  }
}, [query]);
```

Add TypeScript types:

```tsx
// types/plausible.d.ts
declare global {
  interface Window {
    plausible?: (event: string, options?: { props: Record<string, string> }) => void;
  }
}
```

---

## Option 3: Google Analytics 4 (Most Features)

**Time:** 5 minutes | **Cost:** Free

**⚠️ Requires cookie consent banner for GDPR compliance**

### Steps

1. **Create GA4 property** at [analytics.google.com](https://analytics.google.com)

2. **Get Measurement ID** (looks like `G-XXXXXXXXXX`)

3. **Install package:**
   ```bash
   npm install @next/third-parties
   ```

4. **Add environment variable** to Railway:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

5. **Update `app/layout.tsx`:**
   ```tsx
   import { GoogleAnalytics } from '@next/third-parties/google';

   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body>
             <AppShell>{children}</AppShell>
             {process.env.NODE_ENV === 'production' && (
               <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
             )}
           </body>
         </html>
       </ClerkProvider>
     );
   }
   ```

6. **Deploy** and check GA4 dashboard in 24 hours

**✓ Done!** View analytics in Google Analytics.

**⚠️ TODO:** Add cookie consent banner (required by GDPR)

---

## Comparison

| Feature | Vercel | Plausible | GA4 |
|---------|--------|-----------|-----|
| **Setup Time** | 2 min | 5 min | 5 min |
| **Privacy** | Good | Excellent | Requires consent |
| **Cost** | Free | Free (<10k) | Free |
| **Features** | Basic | Basic | Advanced |
| **GDPR** | Compliant | Compliant | Needs consent |
| **Dashboard** | Vercel | Plausible | Google |

---

## Recommendation

**For Portfolio Project:**
→ Use **Plausible** (privacy-friendly, no cookies, clean dashboard)

**If Already on Vercel:**
→ Use **Vercel Analytics** (zero config)

**If You Need Advanced Tracking:**
→ Use **GA4** (but add cookie consent)

---

## What You'll Track

All options track:
- Pageviews
- Unique visitors
- Referral sources
- Device types (mobile, desktop, tablet)
- Geographic location
- Bounce rate
- Session duration

---

## Testing

To test in production:

1. Deploy with analytics code
2. Visit your site in incognito mode
3. Wait 5-10 minutes
4. Check analytics dashboard
5. Verify events are showing up

**Note:** Analytics may take 24-48 hours to show full data.

---

## Next Steps

After analytics are working:

1. Set up goals/conversions (e.g., search queries, clicks to stores)
2. Create custom events for key actions
3. Monitor weekly to understand user behavior
4. Adjust based on insights

---

## Troubleshooting

**No data showing:**
- Wait 24 hours for data to appear
- Check browser console for errors
- Verify environment variables are set
- Ensure you're in production mode

**Script blocked by ad blocker:**
- Expected behavior - some users block analytics
- Typically 10-30% of traffic blocked
- Privacy-friendly options (Plausible) have higher load rates

---

**Choose your option and get started! You'll have analytics in under 5 minutes.**

For detailed setup and advanced features, see [ANALYTICS_MONITORING_SETUP.md](ANALYTICS_MONITORING_SETUP.md).

