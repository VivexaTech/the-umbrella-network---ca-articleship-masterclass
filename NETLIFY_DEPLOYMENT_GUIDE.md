# Netlify Deployment Guide — CA Articleship Masterclass

This application is fully pre-configured and optimized for **Netlify** deployment.

---

## What Has Been Configured for Netlify

1. **`netlify.toml`**:
   - Pre-configured build command: `npm run build`
   - Publish directory: `dist`
   - Netlify Serverless Functions: `netlify/functions`
   - Automatic API rewrite: `/api/*` &rarr; `/.netlify/functions/api/:splat`
   - Single Page Application (SPA) fallback: `/*` &rarr; `/index.html` (HTTP 200)
   - Optimized HTTP headers for asset caching and web security

2. **`public/_redirects`**:
   - Ensures deep routing and browser page refreshes work flawlessly across all browsers.

3. **`netlify/functions/api.ts`**:
   - Powered by `serverless-http`, wrapping the entire Express backend into an AWS Lambda / Netlify Serverless Function.
   - Handles public endpoints (`/api/batches`, `/api/settings`, `/api/speakers`, `/api/testimonials`) and transaction endpoints (`/api/payments/create-order`, `/api/payments/verify`).

4. **Resilient Client Defaults**:
   - Built-in instant fallback data (`src/data/defaultData.ts`) ensures the page never flashes an empty state during cold starts or static deployments.

---

## Deployment Steps

### Method 1: Git-Based Deployment (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Log in to **[Netlify](https://app.netlify.com)**.
3. Click **"Add new site"** &rarr; **"Import an existing project"**.
4. Select your Git provider and repository.
5. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
6. *(Optional)* Add any desired environment variables (see below).
7. Click **"Deploy site"**. Your site will be live within 1–2 minutes!

---

### Method 2: Netlify CLI

If you prefer deploying from your terminal:

```bash
# 1. Install Netlify CLI globally
npm install -g netlify-cli

# 2. Log in to Netlify
netlify login

# 3. Build the project
npm run build

# 4. Deploy to production
netlify deploy --prod
```

---

## Environment Variables (Optional)

In your Netlify Dashboard, navigate to **Site configuration** &rarr; **Environment variables** to configure:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `ADMIN_TOKEN` | Secret token used to access the admin panel | `umbrella_admin_secret_token_2026` |
| `SUPABASE_URL` | Supabase Cloud Database URL | Optional cloud backup |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | Optional cloud backup |
| `SMTP_USER` | Gmail address for automated email confirmations | `caumbrellanetwork@gmail.com` |
| `SMTP_PASS` | Gmail App Password (16 characters) | Optional |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Optional (UPI QR mode active) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Optional |

---

## Verification Checklist

Once deployed on Netlify:
- [x] Homepage loads with all cohorts, countdown timer, curriculum, and mentor details.
- [x] Verified student speakers and testimonials (Chetan Patil, Om Shukla, Sneha Solanki) render immediately.
- [x] The registration modal opens smoothly, displays batch details, and generates the UPI QR code.
- [x] Admin panel is accessible by clicking **"Admin Portal"** in the footer or navigating to `/admin` or `#admin`.
