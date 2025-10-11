# Clerk JWT Template Setup for Supabase

This guide explains how to configure Clerk to work with Supabase Row-Level Security (RLS).

## Why This Is Needed

The collections feature uses Supabase RLS policies to ensure users can only access their own data. These policies check the user ID in the JWT token, but Clerk doesn't include the user ID by default. You need to configure a JWT template.

## Step-by-Step Instructions

### 1. Go to Clerk Dashboard

1. Open [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. In the left sidebar, click **JWT Templates**

### 2. Create or Edit Supabase Template

**If you see a "Supabase" template:**

- Click on it to edit

**If you don't have a Supabase template:**

- Click **+ New template** button
- Click **Supabase** from the list of integrations
- Give it a name: "Supabase"

### 3. Configure the Template

In the template editor, you should see a JSON configuration. Make sure it includes:

```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "full_name": "{{user.full_name}}",
    "avatar_url": "{{user.image_url}}"
  }
}
```

**The critical line is:** `"sub": "{{user.id}}"`

This includes the user ID in the JWT token, which Supabase RLS policies use to identify users.

### 4. Get Your Supabase JWT Secret (Important!)

You need to add your Supabase JWT secret to Clerk:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon in left sidebar)
4. Click **API** in the settings menu
5. Scroll down to **JWT Settings**
6. Copy the **JWT Secret** (it's a long string starting with a random character sequence)

### 5. Add Supabase JWT Secret to Clerk

Back in the Clerk JWT template editor:

1. Scroll down to **Signing Keys**
2. Find the **Signing Algorithm** dropdown
3. Select **HS256** (HMAC with SHA-256)
4. A **Signing Key** field will appear
5. Paste your Supabase JWT Secret
6. Click **Save** (or **Apply Changes**)

### 6. Update Environment Variables (Optional but Recommended)

If you want to explicitly set the JWT template name in your code, add this to `frontend/.env.local`:

```bash
# Clerk JWT Template
CLERK_JWT_TEMPLATE_NAME=supabase
```

But this is optional - the code will use "supabase" as the template name by default.

### 7. Test the Setup

1. **Restart your dev server:**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Sign in to your app**

3. **Try creating a collection:**
   - Go to `/collections/new`
   - Fill in the form
   - Click "Create Collection"

4. **Check for errors:**
   - Open browser console (F12)
   - If you see "new row violates row-level security" → JWT not configured correctly
   - If collection is created successfully → It works! 🎉

## Troubleshooting

### Error: "No authentication token available"

**Problem:** The JWT template doesn't exist or has the wrong name.

**Solution:**

1. Check the template name in Clerk dashboard
2. Make sure it's exactly `supabase` (lowercase)
3. Or update the code to use your template name:

```typescript
// In frontend/supabase/client.ts
const token = await getToken({ template: "your-template-name" });
```

### Error: "invalid JWT: signature verification failed"

**Problem:** The Supabase JWT secret in Clerk doesn't match your Supabase project.

**Solution:**

1. Go to Supabase Dashboard → Settings → API
2. Copy the JWT Secret again
3. Paste it into Clerk JWT template signing key
4. Save and restart your dev server

### Error: "new row violates row-level security policy"

**Problem:** The JWT doesn't contain the user ID in the `sub` claim.

**Solution:**

1. Check the JWT template JSON includes `"sub": "{{user.id}}"`
2. Save the template
3. Sign out and sign back in (to get a new token)
4. Try again

### How to Verify JWT Contents

To check what's in your JWT token:

1. Open browser console
2. Paste this code:

```javascript
const { getToken } = await import('@clerk/nextjs');
const token = await getToken({ template: 'supabase' });
console.log('Token:', token);

// Decode the token (it's base64)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Payload:', payload);
```

3. Check the payload contains:
   - `sub`: Your Clerk user ID (e.g., "user_2abc123xyz")
   - `email`: Your email address

If `sub` is missing, the JWT template isn't configured correctly.

## Alternative: Simpler Setup (For Development Only)

If you're having trouble with the JWT template, you can temporarily disable RLS for testing:

```sql
-- WARNING: ONLY USE FOR TESTING - MAKES YOUR DATA PUBLIC
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items DISABLE ROW LEVEL SECURITY;
```

This will let you test the feature, but **anyone can access any collection**. Don't use this in production!

To re-enable:

```sql
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
```

## Summary Checklist

- [ ] Created Supabase JWT template in Clerk
- [ ] Added `"sub": "{{user.id}}"` to template JSON
- [ ] Copied Supabase JWT Secret from Supabase Dashboard
- [ ] Added JWT secret as signing key in Clerk (HS256 algorithm)
- [ ] Saved the template
- [ ] Restarted dev server
- [ ] Tested creating a collection
- [ ] No RLS errors in console

Once all boxes are checked, the collections feature should work perfectly!
