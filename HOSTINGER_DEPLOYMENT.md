# Hostinger Deployment Guide: CA Articleship Masterclass

This guide provides step-by-step instructions to deploy The Umbrella Network CA Articleship Masterclass application to **Hostinger**.

---

## Architecture Overview

The application is a full-stack Node.js + React (Express + Vite) application:
- **Frontend**: High-performance React 19 SPA built with Tailwind CSS.
- **Backend**: Express.js server (`dist/server.cjs`) handling batch management, Razorpay order creation, ICICI UPI 12-digit UTR validation, email dispatch with Google Drive resource unlocking, Supabase synchronization, and the admin verification dashboard.
- **Production Entry Points**:
  - `dist/server.cjs` (bundled production server)
  - `app.cjs` (root-level wrapper for Hostinger hPanel Node.js selector)
  - `ecosystem.config.cjs` (PM2 process manager config for Hostinger VPS)
  - `.htaccess` (LiteSpeed / Apache reverse proxy for Hostinger Cloud/Shared Hosting)

---

## Method 1: Deploying via Hostinger hPanel (Cloud / Web Hosting with Node.js)

Hostinger Cloud Hosting and Business Web Hosting plans include a built-in **Node.js Application Manager** in hPanel.

### Step 1: Export and Upload the Project
1. In Google AI Studio Build, export the project as a **ZIP** file (via the top-right Settings/Export menu).
2. Log into your **Hostinger hPanel** (`https://hpanel.hostinger.com`).
3. Navigate to **Websites** → select your domain → **File Manager**.
4. Go to your domain folder (e.g. `public_html` or create a directory like `masterclass-app`).
5. Upload the ZIP file and click **Extract**.

### Step 2: Configure the Node.js Application in hPanel
1. In hPanel, use the search bar or scroll to **Advanced** → **Node.js**.
2. Click **Create Application** (or manage your existing Node.js app) and set:
   - **Node.js Version**: Select `20.x` (or `18.x`).
   - **Application Mode**: `Production`
   - **Application Root**: The directory where you extracted the files (e.g., `/home/uXXXXXXXXX/domains/yourdomain.com/public_html`).
   - **Application Startup File**: `app.cjs` (or `dist/server.cjs`).
3. Click **Create** or **Save**.

### Step 3: Configure Environment Variables
In the File Manager, create or edit your `.env` file in the project root:
```env
NODE_ENV=production
APP_URL=https://yourdomain.com
HOSTINGER_PORT=3000

# Razorpay Keys (Indian Payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_key

# Supabase Enrollment Sync
SUPABASE_URL=https://ohvjnllfxnalvtwzcxkm.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Hostinger SMTP Email Configuration (Free with your Hostinger domain)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@yourdomain.com
SMTP_PASS=your_hostinger_email_password
ADMIN_EMAIL=caumbrellanetwork@gmail.com

# Masterclass Google Drive Resources Folder
GOOGLE_DRIVE_RESOURCES_URL=https://drive.google.com/drive/u/4/folders/1Tq4a24HL9V4SxrEFsjfOpSMLK085_6nD

# Admin Dashboard Access
ADMIN_TOKEN=umbrella_admin_secret_token_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_secure_admin_password
```

### Step 4: Install Dependencies & Run Production Build
1. In hPanel **Node.js**, click **Run NPM Install**.
2. Open the **SSH / Web Terminal** in hPanel:
   ```bash
   cd public_html
   npm install
   npm run build
   ```
   *(This compiles both the Vite client into `dist/` and compiles the backend server into `dist/server.cjs`)*.
3. In hPanel Node.js section, click **Restart Application**.
4. Open `https://yourdomain.com` in your browser.

---

## Method 2: Deploying to Hostinger VPS (Ubuntu + Nginx + PM2)

Hostinger VPS provides full performance and complete control.

### Step 1: Connect to your Hostinger VPS
```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Install Node.js 20, Git, and PM2
```bash
# Update package list
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### Step 3: Clone or Upload Project
```bash
# Create web directory
sudo mkdir -p /var/www/umbrella-masterclass
sudo chown -R $USER:$USER /var/www/umbrella-masterclass

# Copy your project files here (via SCP, Git, or FileZilla)
cd /var/www/umbrella-masterclass
```

### Step 4: Configure Production `.env`
Create `/var/www/umbrella-masterclass/.env` and insert your production values (see template above).

### Step 5: Install & Build
```bash
npm install
npm run build
```

### Step 6: Start Process with PM2
We have included `ecosystem.config.cjs` pre-configured for Hostinger:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 7: Configure Nginx Reverse Proxy
We have included `nginx.hostinger.conf`:
```bash
sudo cp nginx.hostinger.conf /etc/nginx/sites-available/umbrella-masterclass
```
Edit `/etc/nginx/sites-available/umbrella-masterclass` to replace `yourdomain.com` with your actual domain name:
```bash
sudo nano /etc/nginx/sites-available/umbrella-masterclass
```
Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/umbrella-masterclass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Install Free SSL via Certbot
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Hostinger Business Email Setup (Titan / Hostinger Webmail)

To send automated registration confirmation emails and Google Drive resource access links from your domain:
1. In hPanel, go to **Emails** → **Email Accounts** → create `contact@yourdomain.com`.
2. Hostinger SMTP credentials:
   - **SMTP Host**: `smtp.hostinger.com`
   - **Port**: `465` (SSL)
   - **Username**: `contact@yourdomain.com`
   - **Password**: Your email mailbox password
3. Save these in your `.env` file. Any time a student's UPI payment is approved in the Admin Dashboard, the system will instantly dispatch the confirmation email via Hostinger's mail server.

---

## Admin Portal & Verification on Production
- Access your live admin dashboard anytime at: `https://yourdomain.com` (click the lock icon in the footer or log in with your admin credentials).
- Review pending 12-digit UPI UTRs against your ICICI bank credits and approve them in one click.
