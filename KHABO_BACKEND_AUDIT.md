# KHABO Backend Audit

## Project Identity
- Framework: Next.js 14 (App Router), TypeScript
- ORM: Prisma 5 with PostgreSQL
- Auth: NextAuth.js v4 (JWT sessions, Credentials/phone+password, PrismaAdapter)
- Payments: SSLCommerz (sandbox/prod toggle)
- Location: `E:\New folder (3)\khabo\khabo`

## Architecture
- `app/` — Next.js App Router pages and API routes
- `app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `app/api/checkout/route.ts` — order creation
- `app/api/payment/[result]/route.ts` — SSLCommerz callback (success/fail/cancel/ipn)
- `lib/auth.ts` — authOptions, getSession, requireRole
- `lib/db.ts` — PrismaClient singleton
- `lib/sslcommerz.ts` — payment init + validation
- `prisma/schema.prisma` — data model
- `middleware.ts` — route protection
- `components/` — UI components (CartProvider, CartDrawer, Nav, etc.)

## Data Models (Prisma)
- User (id, name, email, phone, password, role: CUSTOMER/VENDOR/ADMIN)
- Account, Session, VerificationToken (NextAuth)
- Vendor (userId, shopName, area, approved, commission, products)
- Category, Product (vendorId, categoryId, title, price, stock, active)
- Order (userId, total, status, method, tranId, address, items)
- OrderItem (orderId, productId, vendorId, qty, price)

## Auth
- Phone + password credentials; auto-registers user on first login (role CUSTOMER/VENDOR)
- VENDOR role auto-creates Vendor profile
- JWT strategy with role/uid in token; session enriched

## API Surface
- POST /api/checkout — creates Order + OrderItems (price looked up by id/title/fallback first product)
- POST /api/payment/[result] — validates SSLCommerz, updates order status

## Middleware
- See `middleware.ts` (route protection config)

## Frontend Routes
- `/` home, `/vendor`, `/vendor/apply`, `/checkout`, `/orders/[id]`, `/dashboard`, `/admin`

## Gaps / Notes
- No product CRUD API routes present
- No vendor approval API
- No order listing API beyond checkout
- Checkout price lookup falls back to first product (risk)
- `tranId` never set on order creation (payment flow incomplete)
- No env validation; SSL creds required
- Outer `khabo/components` and `khabo/package-lock.json` are stray (duplicate/empty)
" "E:\New folder (3)\khabo\khabo\KHABO_BACKEND_AUDIT.md"