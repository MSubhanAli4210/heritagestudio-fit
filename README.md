# Heritage Studio

A custom apparel storefront built with Next.js. The customize flow uploads artwork to Cloudinary, stores orders in MongoDB Atlas, and keeps the visitor's order history scoped to an HTTP-only browser cookie.

## Run locally

1. Install dependencies with `npm install`.
2. Configure `.env` with MongoDB, Better Auth, and Resend variables.
3. Configure Atlas and Cloudinary using the setup notes below.
4. Start the app with `npm run dev`.

Never commit `.env.local` or expose these credentials using a `NEXT_PUBLIC_` prefix.

## Authentication

Set `BETTER_AUTH_URL` to the public origin of the app and generate `BETTER_AUTH_SECRET` with at least 32 random characters. Configure `AUTH_ADMIN_EMAILS` as a comma- or semicolon-separated allowlist. Accounts matching that list receive the `admin` role when first created.

Email verification and password recovery use Resend. Set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` to a verified sender and domain. For local development, `BETTER_AUTH_URL=http://localhost:3000` is sufficient.
Authenticated orders are stored against the signed-in user's ID and remain visible across devices. Guest orders remain scoped to the browser visitor cookie.

## MongoDB Atlas

1. Create an Atlas project and cluster in your own account.
2. Create a database user with read/write access only to the `heuristicstudio` database.
3. Configure Network Access for your development IP. For Vercel production, use a deployment option with a stable egress IP and allow only that IP where possible.
4. Copy the application connection string into `MONGODB_URI` and set `MONGODB_DB_NAME=heuristicstudio`.
5. Add those variables to the Vercel project's server-side environment settings for Preview and Production.

The app creates `orders` and `rateLimits` collections with indexes for visitor-scoped order history and expiring rate-limit buckets. Product prices and allowed variants are resolved on the server; order totals are not trusted from the browser. Order line items are embedded as a bounded snapshot, while artwork is stored outside MongoDB. Uploads and order placement are limited per browser token.

## Cloudinary

1. Create a Cloudinary account and copy its cloud name, API key, and API secret into the matching environment variables.
2. Add the values to Vercel server-side environment settings.
3. The server validates supported image types and file signatures, enforces a 4 MB limit, and uploads designs to `heuristicstudio/designs`.

Cloudinary delivery URLs are accessible to anyone who has the URL. Do not upload artwork that must remain private.

## Before taking real orders

The checkout currently records an order as `Received`; it does not collect payment or confirm inventory. Add a payment provider, order notifications, operational order management, and abuse/rate limiting before using it as a public production store. Visitor order history is available only in the browser that placed the order; account-based cross-device history requires authentication.

## Checks

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
