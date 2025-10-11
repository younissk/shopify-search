# Collections & Bookmarks Setup Guide

This guide explains how to set up and use the Collections and Bookmarks feature that integrates Clerk authentication with Supabase.

## Overview

The Collections feature allows authenticated users to:

- **Bookmark products** from any store in the catalog
- **Create custom collections** to organize products
- **Make collections public** to share with others via social media
- **Manage collections** with full CRUD operations

## Prerequisites

- Clerk authentication already set up (see `CLERK_SETUP.md`)
- Supabase database already configured
- Frontend dependencies installed

## Setup Instructions

### 1. Install Required Dependencies

```bash
cd frontend
npm install @radix-ui/react-label
```

### 2. Create Database Tables

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of sql/create_collections_tables.sql
# and run it in Supabase Dashboard > SQL Editor
```

This will create:

- `collections` table with RLS policies
- `collection_items` table with RLS policies
- Helper functions for slug generation
- Automatic timestamp triggers

### 3. Configure Clerk JWT Template (Important!)

For the Row Level Security (RLS) policies to work, you need to configure Clerk to include the user ID in the JWT claims:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates** in the left sidebar
3. Click **New Template** or select your existing Supabase template
4. Add this JSON to your template:

```json
{
  "sub": "{{user.id}}"
}
```

5. Save the template

### 4. Update Supabase Client (If Needed)

Ensure your Supabase client is configured to use the Clerk JWT. In `frontend/supabase/client.ts`, you may need to create an authenticated client:

```typescript
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// For server-side authenticated requests
export async function getAuthenticatedSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}
```

## Features

### 1. Bookmark Button

The bookmark button appears on:

- **Product cards** (top-left corner)
- **Product detail pages** (next to the title)

Click the heart icon to:

- Add the product to existing collections
- Create a new collection on the fly
- Remove the product from collections

### 2. Collections Management

#### Creating a Collection

1. Sign in to your account
2. Click **Collections** in the navigation bar
3. Click **New Collection**
4. Enter a name and optional description
5. Toggle **Make this collection public** if you want to share it
6. Click **Create Collection**

#### Adding Products

1. Browse products or search
2. Click the **heart icon** on any product
3. Select one or more collections
4. Click **Create new collection** to make a new one
5. Products are instantly added

#### Editing a Collection

1. Go to **Collections** page
2. Click on a collection
3. Click **Edit** button
4. Update name, description, or visibility
5. Click **Save Changes**

#### Deleting a Collection

1. Open the collection you want to delete
2. Click **Edit**
3. Click **Delete Collection** (bottom left)
4. Confirm deletion

### 3. Sharing Collections

For **public collections** only:

1. Open the collection
2. Click the **Share** button
3. Choose a platform:
   - **Twitter** - Tweet with collection link
   - **Facebook** - Share to Facebook
   - **LinkedIn** - Share to LinkedIn
   - **Email** - Send via email
   - **Copy Link** - Copy URL to clipboard

## How It Works

### Authentication Flow

1. User signs in via Clerk
2. Clerk provides a JWT with the user ID in the `sub` claim
3. Supabase uses RLS policies to validate the JWT
4. Users can only access their own collections (or public ones)

### Database Structure

**Collections Table:**

```
id (UUID) - Primary key
clerk_user_id (TEXT) - Owner's Clerk ID
name (TEXT) - Collection name
description (TEXT) - Optional description
slug (TEXT) - URL-friendly identifier
is_public (BOOLEAN) - Visibility setting
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**Collection Items Table:**

```
id (UUID) - Primary key
collection_id (UUID) - Foreign key to collections
product_id (TEXT) - Product identifier
domain (TEXT) - Store domain
position (INTEGER) - Sort order
notes (TEXT) - Optional user notes
added_at (TIMESTAMP)
```

### Row Level Security (RLS)

RLS policies ensure:

- Users can only create/edit/delete their own collections
- Anyone can view public collections
- Users can only add items to their own collections
- Collection items inherit visibility from parent collection

## API Reference

### Server Actions

All collection operations are server-side functions in `frontend/supabase/collection.ts`:

- `getUserCollections()` - Get all user's collections
- `getCollectionBySlug(slug)` - Get a specific collection (public or owned)
- `createCollection(input)` - Create a new collection
- `updateCollection(id, input)` - Update collection details
- `deleteCollection(id)` - Delete a collection and its items
- `addProductToCollection(input)` - Bookmark a product
- `removeProductFromCollection(collectionId, itemId)` - Remove bookmark
- `getProductCollections(productId, domain)` - Check if product is bookmarked
- `reorderCollectionItems(collectionId, itemIds)` - Reorder items

### TypeScript Types

All types are defined in `frontend/types/Collection.ts`:

- `Collection` - Collection interface
- `CollectionItem` - Item in a collection
- `CollectionWithProductDetails` - Collection with full product data
- `CreateCollectionInput` - Input for creating collections
- `UpdateCollectionInput` - Input for updating collections

## Troubleshooting

### Issue: "Not authenticated" errors

**Solution:** Ensure you're signed in and the Clerk JWT template is configured correctly.

### Issue: RLS policy violations

**Solution:** Check that your Clerk JWT template includes the `sub` claim with the user ID.

### Issue: Products not appearing in collections

**Solution:** Verify that:

1. The product exists in the `products` table
2. The `product_id` and `domain` match exactly
3. The collection owner hasn't been changed

### Issue: Slug conflicts

**Solution:** The system automatically generates unique slugs. If you see errors, check for:

1. Very long collection names (>50 chars are truncated)
2. Special characters in names (they're stripped)

## Development Tips

### Testing RLS Policies

To test RLS policies in Supabase SQL Editor:

```sql
-- Set the JWT claim to simulate a user
SET request.jwt.claims = '{"sub": "user_123abc"}';

-- Now run queries as that user
SELECT * FROM collections WHERE clerk_user_id = 'user_123abc';
```

### Adding New Fields

To add custom fields to collections:

1. Update the database schema in Supabase
2. Update `frontend/types/Collection.ts`
3. Update the forms in edit/new pages
4. Update RLS policies if needed

## Next Steps

Consider enhancing the feature with:

- **Drag-and-drop reordering** of collection items
- **Bulk operations** (add multiple products at once)
- **Collection templates** for common use cases
- **Activity feed** showing recent bookmarks
- **Collection statistics** (views, likes, etc.)
- **Collaborative collections** (multiple owners)

## Support

For issues or questions:

1. Check the [Clerk documentation](https://clerk.com/docs)
2. Check the [Supabase documentation](https://supabase.com/docs)
3. Review the RLS policies in Supabase dashboard
4. Enable debug logging in development mode
