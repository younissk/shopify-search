-- Collections & Bookmarks Schema
-- This schema enables users to create collections and bookmark products
-- Integrates with Clerk authentication via clerk_user_id

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on clerk_user_id for faster user collection queries
CREATE INDEX IF NOT EXISTS idx_collections_clerk_user_id ON collections(clerk_user_id);

-- Create index on slug for public collection lookups
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- Create collection_items table
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for collection_items
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_product ON collection_items(product_id, domain);

-- Create unique constraint to prevent duplicate products in same collection
CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_items_unique ON collection_items(collection_id, product_id, domain);

-- Enable Row Level Security (RLS)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections table

-- Users can read their own collections
CREATE POLICY "Users can read their own collections"
    ON collections FOR SELECT
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Anyone can read public collections
CREATE POLICY "Anyone can read public collections"
    ON collections FOR SELECT
    USING (is_public = true);

-- Users can create their own collections
CREATE POLICY "Users can create their own collections"
    ON collections FOR INSERT
    WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own collections
CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub')
    WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own collections
CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policies for collection_items table

-- Users can read items from their own collections
CREATE POLICY "Users can read items from their own collections"
    ON collection_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Anyone can read items from public collections
CREATE POLICY "Anyone can read items from public collections"
    ON collection_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.is_public = true
        )
    );

-- Users can add items to their own collections
CREATE POLICY "Users can add items to their own collections"
    ON collection_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Users can update items in their own collections
CREATE POLICY "Users can update items in their own collections"
    ON collection_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Users can delete items from their own collections
CREATE POLICY "Users can delete items from their own collections"
    ON collection_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on collections
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := regexp_replace(
        regexp_replace(
            lower(trim(name)),
            '[^a-z0-9\s-]',
            '',
            'g'
        ),
        '\s+',
        '-',
        'g'
    );
    
    -- Limit length
    base_slug := substring(base_slug from 1 for 50);
    
    final_slug := base_slug;
    
    -- Check for uniqueness and append counter if needed
    WHILE EXISTS (SELECT 1 FROM collections WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

