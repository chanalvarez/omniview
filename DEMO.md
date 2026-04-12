# OmniView — portfolio demo

## Environment

Copy `.env.demo` to `.env.local` for local development, or set the same variables on Vercel / your host:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Demo Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Demo project anon key |
| `NEXT_PUBLIC_IS_DEMO` | Set to `true` to enable the demo banner and restriction modal |

```bash
# Windows (PowerShell)
Copy-Item .env.demo .env.local

# macOS / Linux
cp .env.demo .env.local
```

Then `npm run dev`.

## Demo login

After seeding (below), sign in with:

- **Email:** `demo@omniview.com`
- **Password:** `demo123`

## Seed data

1. Create the user in Supabase **Authentication** (see `supabase/demo-seed.sql` header).
2. Replace `YOUR_DEMO_USER_UUID` in `supabase/demo-seed.sql` with that user’s UUID.
3. Run the SQL in the Supabase **SQL Editor**.

You should see four sample businesses. The home dashboard shows **sample** portfolio revenue and analytics (PHP figures and chart) whenever at least one business exists.

## Demo mode behavior

- Top banner: portfolio preview notice + link to Fiverr.
- **Register**, **Connect business** (modal and API), and **ServeWise connect** on the business detail page are blocked with a “Demo Restriction” modal.
- **Sign in** still works so visitors can explore the real UI with seeded data.

## Hire / contact

[Fiverr — chanalvarez](https://www.fiverr.com/chanalvarez)
