# Troubleshooting Collections Feature

If clicking "Create Collection" does nothing, follow these steps to diagnose the issue:

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Try clicking "Create Collection" again
4. Look for error messages in red

### Common Console Errors:

**"relation 'collections' does not exist"**
- **Problem:** Database tables haven't been created
- **Solution:** Run the SQL schema (see Step 2)

**"RLS policy violation" or "permission denied"**
- **Problem:** Clerk JWT not configured or RLS policies failing
- **Solution:** Check Clerk JWT configuration (see Step 3)

**"Not authenticated"**
- **Problem:** User not signed in or Clerk not working
- **Solution:** Ensure you're signed in and Clerk is set up correctly

## Step 2: Create Database Tables

You **must** run the SQL schema before the feature will work:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `sql/create_collections_tables.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected output:** "Success. No rows returned"

## Step 3: Configure Clerk JWT Template

For RLS policies to work, Clerk must include the user ID in the JWT:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Click **JWT Templates** in the left sidebar
4. If you have a Supabase template:
   - Click on it to edit
5. If not:
   - Click **New template**
   - Choose **Supabase** template
6. Ensure the JSON includes:

```json
{
  "sub": "{{user.id}}"
}
```

7. Click **Save**

## Step 4: Verify Environment Variables

Check that your Supabase environment variables are set in `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 5: Test Database Connection

Open your browser console and run this query to test if you can connect to Supabase:

```javascript
// In browser console on your site:
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
const { data, error } = await supabase.from('collections').select('count');
console.log('Test result:', { data, error });
```

**Expected results:**
- If tables don't exist: Error about relation not existing → Run SQL schema
- If tables exist but RLS fails: Error about RLS → Check Clerk JWT
- If success: Should show count (probably 0 if new)

## Step 6: Check Network Tab

1. Open Developer Tools
2. Go to **Network** tab
3. Click "Create Collection"
4. Look for requests to your domain
5. Click on any failed requests (red)
6. Check the **Response** tab for error messages

## Step 7: Manual Database Test

Test if you can manually insert a collection in Supabase:

1. Go to Supabase Dashboard → **Table Editor**
2. Look for `collections` table
   - **If you don't see it:** Run the SQL schema (Step 2)
   - **If you see it:** Continue below
3. Click **Insert row**
4. Fill in:
   - `clerk_user_id`: Your Clerk user ID (get from Clerk Dashboard → Users)
   - `name`: "Test Collection"
   - `slug`: "test-collection"
   - `is_public`: false
   - Leave other fields as default
5. Click **Save**

**If insert fails:** RLS policies are blocking you (check JWT template)
**If insert succeeds:** Backend is working, check frontend code

## Step 8: Check Logs with Console Output

I've added console.log statements to help debug. When you click "Create Collection", you should see in the console:

1. "Creating collection..." with your data
2. "Collection creation result:" with the response
3. Either "Navigating to collection:" or an error message

If you see nothing, the button click isn't firing. Check:
- Is the button enabled (not grayed out)?
- Is the name field filled in?
- Are there any JavaScript errors preventing the handler from running?

## Common Solutions

### Solution 1: Tables Not Created
```sql
-- Run this in Supabase SQL Editor
-- Copy from sql/create_collections_tables.sql
```

### Solution 2: RLS Policy Too Strict

If you keep getting permission errors, temporarily disable RLS to test:

```sql
-- TEMPORARY ONLY - REMOVE AFTER TESTING
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items DISABLE ROW LEVEL SECURITY;
```

Try creating a collection. If it works:
- The tables are fine
- The problem is RLS/JWT configuration
- Re-enable RLS and fix the JWT template

```sql
-- Re-enable after testing
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
```

### Solution 3: Clear Cache and Rebuild

Sometimes Next.js cache causes issues:

```bash
cd frontend
rm -rf .next
npm run dev
```

## Still Not Working?

1. **Share the console error message** - Look for red errors in browser console
2. **Check if you're signed in** - Look for the user button in top right
3. **Verify Clerk is working** - Can you sign in/out successfully?
4. **Check Supabase status** - Is your project running at supabase.com?

## Quick Checklist

- [ ] I've run `sql/create_collections_tables.sql` in Supabase
- [ ] I can see `collections` and `collection_items` tables in Supabase Table Editor
- [ ] I've configured the Clerk JWT template with `{"sub": "{{user.id}}"}`
- [ ] I'm signed in to the app (see user button in nav)
- [ ] Environment variables are set in `.env.local`
- [ ] I've checked the browser console for errors
- [ ] I've checked the Network tab for failed requests

If all boxes are checked and it still doesn't work, there's likely a detailed error message in the browser console that will point to the specific issue.

