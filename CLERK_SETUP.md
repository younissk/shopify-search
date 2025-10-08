# Clerk Authentication Setup

This project uses Clerk for authentication. Follow these steps to set up Clerk:

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application in your Clerk dashboard

## 2. Get Your API Keys

1. In your Clerk Dashboard, go to the [API Keys page](https://dashboard.clerk.com/last-active?path=api-keys)
2. Copy your **Publishable Key** and **Secret Key**

## 3. Set Up Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following content:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

Replace `YOUR_PUBLISHABLE_KEY` and `YOUR_SECRET_KEY` with your actual keys from the Clerk dashboard.

## 4. Optional: Customize Authentication URLs

You can customize the sign-in and sign-up URLs by adding these optional variables to your `.env.local`:

```bash
# Optional: Customize Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 5. Start the Development Server

```bash
cd frontend
npm run dev
```

## Features Included

- **Sign In/Sign Up buttons** in the navigation bar
- **User button** with profile management when signed in
- **Modal-based authentication** (no separate pages needed)
- **Mobile-responsive** authentication UI
- **Automatic session management**

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already included in `.gitignore`
- Use different keys for development and production environments
