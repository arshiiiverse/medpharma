# Connecting Medpharma to a real database (Supabase)

Without a database, Medpharma runs in **demo mode**: orders and admin changes are saved only in the visitor's browser. Connecting a free Supabase project makes it a real store:

- Orders, bookings and contact messages are saved online.
- The admin panel shows every order from every device, with a real email and password login.
- Stock and prices are checked on the server, so nobody can change a price in their browser.
- Product, stock and settings changes apply for every visitor.

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and click **New project**.
2. Name it `medpharma`, pick the **Mumbai** region, and set a database password. Keep the password private; the site doesn't need it.

## 2. Create the database

1. In your project, open **SQL Editor** and click **New query**.
2. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. You should see "Success". This creates the tables, the security rules and the 24 starting products.

## 3. Create your admin account

1. Go to **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick **Auto Confirm User**.
2. Back in **SQL Editor**, run this, with your email in place of the example:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
3. Recommended: under **Authentication → Sign In / Providers**, turn off **Allow new users to sign up**. Then only accounts you create can sign in.

## 4. Connect the website

1. Go to **Project Settings → API** (or **API Keys**) and copy:
   - the **Project URL**, for example `https://abcdxyz.supabase.co`
   - the **publishable** key (labelled `anon` / `public` in older projects)
2. Paste both into [`assets/config.js`](assets/config.js):
   ```js
   window.MP_CONFIG = {
     supabaseUrl: 'https://abcdxyz.supabase.co',
     supabaseKey: 'sb_publishable_…'
   };
   ```
3. Commit and push. GitHub Pages updates in about a minute.

> **Never** paste the `service_role` / secret key or your database password into the website. The publishable key is designed to be public: the row-level security rules in `schema.sql` decide what visitors can do.

## What visitors can and can't do

| | Shoppers (publishable key) | Admin (signed in) |
|---|---|---|
| Read products & settings | ✅ visible products only | ✅ all |
| Place an order | ✅ via `place_order` (server checks stock, prices and PIN code) | ✅ |
| See an order | ✅ only with the order ID **and** the phone number used | ✅ all orders |
| Cancel an order | ✅ own order, before it's out for delivery | ✅ any status |
| Book a test or doctor, send a message | ✅ via checked functions | ✅ |
| Edit products, stock, settings, statuses | ❌ | ✅ |
