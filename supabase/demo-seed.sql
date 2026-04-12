-- OmniView portfolio demo seed (run in your demo Supabase SQL editor)
--
-- Prerequisites:
-- 1. Create the demo user in Dashboard → Authentication → Users → Add user
--    Email:    demo@omniview.com
--    Password: demo123
--    Enable "Auto Confirm User" if available.
-- 2. Look up the user's UUID:
--    SELECT id, email FROM auth.users WHERE email = 'demo@omniview.com';
-- 3. Replace every occurrence of YOUR_DEMO_USER_UUID below with that UUID, then run this script.

-- Optional: ensure tagline column exists (safe to run)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';

INSERT INTO public.businesses (user_id, name, tagline, created_at)
VALUES
  (
    'YOUR_DEMO_USER_UUID'::uuid,
    'Northwind Traders Inc.',
    'Regional wholesale & distribution',
    now() - interval '72 days'
  ),
  (
    'YOUR_DEMO_USER_UUID'::uuid,
    'Sterling Coffee Roasters',
    'Specialty retail cafés & B2B supply',
    now() - interval '54 days'
  ),
  (
    'YOUR_DEMO_USER_UUID'::uuid,
    'Harborline Logistics',
    'Last-mile fulfillment & warehousing',
    now() - interval '36 days'
  ),
  (
    'YOUR_DEMO_USER_UUID'::uuid,
    'Vertex SaaS Co.',
    'B2B subscription analytics platform',
    now() - interval '18 days'
  );

-- Dashboard already shows sample portfolio revenue / chart when at least one business exists.
-- External integrations (ServeWise, etc.) stay disabled in demo mode in the app UI.
