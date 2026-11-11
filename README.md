# E&H Fabrics — Full-stack storefront and store workspace

A Next.js App Router application for the E&H Fabrics fashion store. It includes a customer storefront, product catalogue, cart and checkout, customer accounts, customer suit requests, a staff workspace, role-based API authorization, stock-aware order creation, delivery settings, and a Neon PostgreSQL integration using Drizzle ORM.

## Important: choose the data mode

- **Demo mode** (`DATA_MODE=demo`) runs without a database and loads the included sample catalogue. Product/order/request mutations are kept in server memory for local demonstration and can be lost on a server restart. Uploaded demo images are written to `public/uploads/`.
- **Neon mode** (`DATA_MODE=neon`) uses Neon PostgreSQL for persistent products, orders, inventory, support requests, store settings, staff roles and Better Auth sessions. Set the environment variables and run the migrations before starting the app.

Do not deploy the app in production using demo mode. The demo administrator is intentionally available only outside production.

## Stack

- Next.js 16 App Router + React 19 + TypeScript
- Drizzle ORM + Neon serverless PostgreSQL driver
- Better Auth email/password authentication
- Zod request validation
- Cloudinary adapter for production image uploads
- CSS design system with responsive layouts

## 1. Run locally without Neon

Requirements: Node.js 22 LTS (or a compatible supported Node release) and npm.

```bash
npm install
```

Copy `.env.example` to `.env` and keep:

```env
DATA_MODE=demo
DEFAULT_DELIVERY_FEE=250
STORE_CURRENCY=PKR
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/` — customer storefront
- `/products` — full catalogue
- `/products/[slug]` — product details
- `/checkout` — checkout and order creation
- `/request-a-suit` — request a product that is not listed
- `/account` — customer sign-in/sign-up experience
- `/admin` — demo administration workspace
- `/api/health` — application health and selected data mode

## 2. Connect Neon when you are ready

1. Create a Neon project and a PostgreSQL database.
2. Copy the Neon connection string from **Neon Console → Connection Details**. Use the pooled connection string when available.
3. Add it to `.env` as `DATABASE_URL`. Never prefix this variable with `NEXT_PUBLIC_` and never commit it.
4. Generate a strong Better Auth secret (at least 32 characters), for example:

   ```bash
   openssl rand -base64 32
   ```

5. Configure the environment:

   ```env
   DATA_MODE=neon
   DATABASE_URL=postgresql://...your-neon-connection-string...
   BETTER_AUTH_SECRET=...your-random-secret...
   BETTER_AUTH_URL=http://localhost:3000
   ```

6. Apply the Drizzle migration:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

7. Populate the Neon catalogue (16 starter suits, categories, collections and initial store settings):

   ```bash
   npm run db:seed
   ```

   On Windows PowerShell, use `npm.cmd run db:seed` if the PowerShell execution policy blocks `npm.ps1`.

   The seed is repeatable: it updates the starter product descriptions, prices and image galleries by SKU, while preserving existing stock quantities and publication statuses. New products start with stock `0` because physical quantities were not included in the supplied archive. Set verified stock in **Admin → Products** before accepting orders.

8. Configure Cloudinary for durable product and reference-photo uploads:

   ```env
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

9. Restart the dev server. The storefront and API now use Neon instead of the in-memory demo repository.

The database schema is in `src/db/schema.ts`; migration files are generated in `drizzle/`. The connection is in `src/db/index.ts`. The `dotenv` package loads `.env` for Drizzle Kit and the seed script.

## 3. Bootstrap the first administrator

The Better Auth user role defaults to `customer`. This is deliberate: a person cannot give themselves staff privileges through the public sign-up form.

1. Set Neon mode and run migrations.
2. Open `/account` and register the account that should own the store.
3. In Neon SQL Editor, promote only that account by its exact email:

   ```sql
   UPDATE "user"
   SET role = 'admin', updated_at = NOW()
   WHERE email = 'the-owner-email@example.com';
   ```

4. Sign out and sign back in, then open `/admin`.
5. The admin can now assign existing registered users these roles from **Staff & access**:
   - `manager` — products, orders, inventory and customer support
   - `catalog` — product catalogue and inventory
   - `orders` — order processing and customer information
   - `support` — customer requests and order visibility
   - `customer` — customer account only

Role permissions are enforced on the server in `src/lib/server/auth.ts`, not just by hiding dashboard controls. Keep at least one trusted administrator account.

## 4. Delivery and payment configuration

The initial checkout methods are **Cash on Delivery** and **Bank Transfer**. No payment gateway has been connected.

The administrator can configure the standard delivery fee, free-delivery threshold, WhatsApp number, store contact details and bank-transfer instructions under **Admin → Store settings**. The backend calculates the delivery charge during order creation; it does not trust a total or product price sent by the browser. Manual stock changes and order reservations/cancellations are recorded in the inventory movement ledger.

Set a free-delivery threshold of `0` to disable the threshold. The standard delivery fee can also be `0` if the business chooses to offer free delivery.

## 5. Image uploads

- In demo mode, uploads are saved in `public/uploads/` for local preview. This is not durable storage for serverless hosting.
- In Neon mode, upload routes require Cloudinary credentials. Product photos and support reference images are uploaded to separate Cloudinary folders. Cloudinary `res.cloudinary.com` URLs are permitted by the Next.js image configuration.
- During `npm run db:seed`, if all three Cloudinary credentials are present, the 16 starter product images and available detail views are uploaded to `eh-fabrics/products` and their secure Cloudinary URLs are saved in Neon. If Cloudinary is not configured or the upload service is temporarily unavailable, the seed stores the matching `/products/...` paths instead; those assets are bundled in `public/products/` and served by Next.js.
- Existing starter images remain in `public/products/` so seeding works from a complete project checkout and Cloudinary is not a prerequisite for populating product records.

Supported uploads: JPG, PNG and WebP; maximum 6 MB per file.

## 6. Backend route map

| Route | Purpose | Access |
|---|---|---|
| `GET /api/products` | Public active catalogue | Public |
| `GET /api/inventory` | Active product rows for stock workspace | `inventory:read` |
| `POST /api/products` | Create a product | `products:write` |
| `GET /api/products?includeDrafts=true` | Full catalogue | `products:read` |
| `GET/PATCH/DELETE /api/products/:id` | Product detail and management | Read / write / delete permissions |
| `POST /api/orders` | Create an order, re-price on server, reserve stock | Public checkout |
| `GET /api/orders` | List store orders | `orders:read` |
| `PATCH /api/admin/orders/:id` | Change order status | `orders:write` |
| `POST /api/support-requests` | Submit a suit request | Public |
| `GET /api/support-requests` | List customer suit requests | `support:read` |
| `PATCH /api/admin/support-requests/:id` | Update request status | `support:write` |
| `GET/PUT /api/admin/settings` | Read/update delivery and store settings | `settings:manage` |
| `GET/PATCH /api/admin/staff` | List and assign staff roles | `staff:manage` |
| `POST /api/uploads` | Product image upload | `products:write` |
| `POST /api/support-uploads` | Reference image upload | Public, type/size restricted |
| `/api/auth/*` | Better Auth sign-in, sign-up and sessions | Better Auth |
| `GET /api/account/orders` | Signed-in customer order history | Signed-in user |

## 7. Operational notes before production

This is a database-ready first implementation, not a claim that a live store is already deployed or payment-certified. Before accepting real customers:

- Add transactional email/SMS or WhatsApp order notifications.
- Add a payment gateway only after choosing a provider and completing its merchant onboarding.
- Configure real delivery rules, shipping carrier workflow, return/exchange policy and bank-transfer details.
- Add durable rate limiting and bot protection to public checkout, sign-up and support endpoints.
- Add backups, error monitoring, structured logs and an operational alert channel.
- Review privacy/terms pages and the retention policy for customer and uploaded reference data.
- Run staging tests with a real Neon branch and verify the production deployment environment.

## 8. Validation status and useful commands

The source package was checked for TypeScript/TSX syntax, internal `@/` import resolution and referenced local product/brand assets. A full dependency-backed type-check, lint and production build could not be completed in the packaging environment because npm registry installation requests timed out. Run the commands below after `npm install` on your machine; resolve any environment- or dependency-specific diagnostics before deployment.

```bash
npm run typecheck
npm run lint
npm run build
```

## 9. Useful commands

```bash
npm run dev          # local development
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
npm run build        # production build
npm run db:generate  # generate SQL migrations from Drizzle schema
npm run db:migrate   # apply migrations to Neon
npm run db:seed      # seed starter catalogue products
npm run db:studio    # open Drizzle Studio
```

## Brand assets and starter catalogue

- Primary and reversed E&H Fabrics SVG logos are in `public/brand/`.
- The monogram app icon is in `public/brand/`.
- Starter product images were selected from the supplied `Suits.zip` archive and optimized to WebP in `public/products/`.
- Starter catalogue prices are assigned from the supplied archive's three price folders (PKR 2,450, 2,500 and 3,000). Review each product photograph, name, price, fabric composition and piece details before launch. The seed does not guess stock: new items start at zero, and verified inventory must be entered in Admin → Products.
