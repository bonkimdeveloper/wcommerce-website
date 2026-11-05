# Khabo – Next.js + Prisma marketplace

## Setup (VS Code terminal)
1. `npm install`
2. `cp .env.example .env` then fill it in (Neon/Supabase Postgres URL, Google OAuth, SMTP, SSLCommerz sandbox)
3. `npx prisma db push` then `npm run db:seed`
4. `npm run dev` -> http://localhost:3000

## Roles
- Anyone who signs in is CUSTOMER. The first account created with `ADMIN_EMAIL` becomes ADMIN.
- "Sell with us" turns a customer into VENDOR; admin must approve at /admin before the shop is visible.

## Payments
- COD works immediately. SSLCommerz (bKash/Nagad/card): set SSL_STORE_ID / SSL_STORE_PASS (sandbox).
- SSLCommerz must reach your site: for local testing use a tunnel (ngrok / cloudflared) and set NEXTAUTH_URL to it.
- Direct bKash/Nagad merchant APIs are not included (need merchant docs from them).

## Google OAuth redirect URI
`{NEXTAUTH_URL}/api/auth/callback/google`
