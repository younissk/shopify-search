# Shopify Search

> A powerful product discovery platform that aggregates and searches across thousands of Shopify stores in real-time.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://shopifysearch.com)
[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)](https://supabase.com/)

## Overview

Shopify Search is a portfolio project that enables users to discover, compare, and explore products from over 1,300 Shopify stores with 580,000+ products indexed. It combines full-text search with semantic search using SentenceBERT embeddings for intelligent product discovery.

### Key Features

- **Multi-Store Search**: Search across thousands of products from different Shopify stores simultaneously
- **Semantic Search**: Find similar products using AI-powered embeddings (SentenceBERT)
- **Full-Text Search**: Lightning-fast text-based product search with PostgreSQL
- **Collections**: Save and organize favorite products (requires authentication)
- **Domain Browsing**: Explore stores by product count and catalog size
- **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Clerk** - Authentication and user management

### Backend

- **Supabase** - PostgreSQL database with real-time capabilities
- **Edge Functions** - Serverless functions for similar product search
- **pgvector** - Vector similarity search for embeddings

### Infrastructure

- **Railway** - Application hosting
- **Python (uv)** - Backend scripts for data ingestion
- **SentenceBERT** - Product embedding generation

## Architecture

```
┌─────────────┐
│   Next.js   │ ─── User Interface (React 19, Server Components)
│   Frontend  │
└──────┬──────┘
       │
       ├─── Clerk Auth ──────────────┐
       │                             │
       ├─── Supabase Client ─────────┤
       │                             │
┌──────▼────────────────────────────▼──┐
│         Supabase Backend             │
│  ┌────────────┐  ┌─────────────┐    │
│  │ PostgreSQL │  │   Edge      │    │
│  │  +pgvector │  │  Functions  │    │
│  └────────────┘  └─────────────┘    │
└───────────────────────────────────────┘
       ▲
       │
┌──────┴──────┐
│   Python    │
│   Scripts   │ ─── Data ingestion, embeddings, scraping
└─────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ with uv
- Supabase account
- Clerk account

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/younissk/shopify-search.git
cd shopify-search
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the `frontend` directory. See [ENV_SETUP.md](frontend/ENV_SETUP.md) for detailed instructions.

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
```

4. **Set up the database**

Run the SQL migrations in your Supabase dashboard:

```bash
sql/create_collections_tables.sql
```

See [COLLECTIONS_SETUP.md](COLLECTIONS_SETUP.md) and [DOMAINS_IMPLEMENTATION.md](DOMAINS_IMPLEMENTATION.md) for details.

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Python Scripts (Optional)

For data ingestion and embeddings generation:

```bash
# Install Python dependencies
uv sync

# Scrape products
uv run python scripts/fetch_products_json.py

# Generate embeddings
uv run python scripts/embeddings_create.py

# Populate domains
uv run python scripts/populate_domains.py
```

## Project Structure

```
shopify-search/
├── frontend/                # Next.js application
│   ├── app/                # App Router pages
│   │   ├── (auth)/        # Authentication routes
│   │   ├── domains/       # Store browsing
│   │   ├── collections/   # User collections
│   │   ├── search/        # Search interface
│   │   ├── privacy/       # Privacy policy
│   │   ├── terms/         # Terms of service
│   │   ├── layout.tsx     # Root layout
│   │   ├── sitemap.ts     # Dynamic sitemap
│   │   └── robots.ts      # Robots.txt
│   ├── components/        # React components
│   ├── lib/              # Utilities and services
│   ├── supabase/         # Supabase client helpers
│   └── types/            # TypeScript definitions
├── scripts/              # Python data scripts
│   ├── fetch_products_json.py
│   ├── embeddings_create.py
│   └── populate_domains.py
└── sql/                  # Database migrations
```

## Features in Detail

### Search Capabilities

- **Text Search**: Fast full-text search using PostgreSQL's `to_tsvector`
- **Semantic Search**: AI-powered similar product recommendations
- **Filters**: Filter by domain, price range, and availability
- **Pagination**: Efficient pagination with server-side rendering

### Collections System

Authenticated users can:
- Create unlimited collections
- Bookmark products across stores
- Make collections public or private
- Share collection URLs
- Organize with custom descriptions

### Domain Management

- Browse all indexed stores
- View store-specific catalogs
- Request domain additions/removals
- See product counts and statistics

## Performance

- **Server-Side Rendering**: Initial page loads are fast with SSR
- **Edge Caching**: Static assets served via CDN
- **Database Optimization**: Indexed columns for quick queries
- **Image Optimization**: Next.js Image component with lazy loading

## Security

- **Authentication**: Clerk handles all auth flows securely
- **Security Headers**: CSP, X-Frame-Options, etc.
- **Row-Level Security**: Supabase RLS protects user data
- **Environment Variables**: Secrets never exposed to client

## SEO Optimization

- **Dynamic Metadata**: Per-page Open Graph and Twitter Cards
- **Structured Data**: JSON-LD schemas for products and organization
- **Sitemap**: Auto-generated sitemap with 500+ pages
- **Robots.txt**: Search engine crawling instructions
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

## Deployment

The application is deployed on Railway. To deploy your own instance:

1. Fork this repository
2. Create a Railway project
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy!

See [Railway Documentation](https://docs.railway.app/) for detailed instructions.

## Contributing

This is a portfolio project, but suggestions and feedback are welcome! Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Share ideas for new features

## Roadmap

- [x] Basic search functionality
- [x] Authentication with Clerk
- [x] Collections system
- [x] Domain browsing
- [x] Semantic search
- [x] SEO optimization
- [ ] Advanced filters (price, category, availability)
- [ ] Product comparison tool
- [ ] Email notifications for saved searches
- [ ] Mobile app (React Native)

## License

This project is open source and available for educational purposes. See individual dependencies for their licenses.

## Acknowledgments

- Product data sourced from public Shopify stores
- Embeddings powered by SentenceBERT
- UI components from Radix UI and shadcn/ui
- Inspiration from modern e-commerce platforms

## Contact

- **Email**: support@shopifysearch.com
- **GitHub**: [@younissk](https://github.com/younissk)
- **Project**: [shopifysearch.com](https://shopifysearch.com)

---

Built with ❤️ as a portfolio project to showcase full-stack development skills.
