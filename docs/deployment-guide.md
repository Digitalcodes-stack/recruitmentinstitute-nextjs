# Deployment Guide — Recruitment Institute Next.js

## Prerequisites

- Ubuntu 22.04+ VPS
- Node.js 22+
- PostgreSQL 16+
- Docker & Docker Compose (optional)
- Nginx
- PM2

---

## Option A — Docker Deployment (Recommended)

### 1. Clone & Configure

```bash
git clone <repo> /var/www/recruitmentinstitute-nextjs
cd /var/www/recruitmentinstitute-nextjs
cp .env.example .env
# Edit .env with your values
nano .env
```

### 2. Run with Docker Compose

```bash
cd docker
docker compose up -d
```

### 3. Run Migrations & Seed

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

---

## Option B — Manual Deployment

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createdb recruitmentinstitute
sudo -u postgres createuser --pwprompt riuser
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE recruitmentinstitute TO riuser;"
```

### 3. Install PM2 & Nginx

```bash
npm install -g pm2
sudo apt install -y nginx
```

### 4. Deploy App

```bash
cd /var/www/recruitmentinstitute-nextjs
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start npm --name "recruitmentinstitute" -- start
pm2 save
pm2 startup
```

### 5. Nginx Config

```nginx
# /etc/nginx/sites-available/recruitmentinstitute.in
server {
    listen 80;
    server_name recruitmentinstitute.in www.recruitmentinstitute.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/recruitmentinstitute.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d recruitmentinstitute.in -d www.recruitmentinstitute.in
```

---

## Database Migration from MySQL

### Step 1 — Export MySQL Data

```bash
# On old server
mysqldump -u xgrkfgsh_recruitmentinstitute -p xgrkfgsh_recruitmentinstitute \
  --no-create-info --complete-insert \
  blog subscribe_email tbl_contactus about_us course_category \
  > /tmp/ri_data.sql
```

### Step 2 — Convert and Import

```bash
# Use migrate-data script (customize for your data)
npx ts-node scripts/migrate-data.ts
```

### Step 3 — Migrate Uploads

```bash
# Copy uploads folder from old server
scp -r old-server:/var/www/recruitmentinstitute.in/uploads/ \
  /var/www/recruitmentinstitute-nextjs/public/uploads/
```

---

## Post-Deployment Checklist

- [ ] Change default admin password (admin@recruitmentinstitute.in / Admin@123)
- [ ] Configure SMTP email settings
- [ ] Set strong JWT_SECRET
- [ ] Verify sitemap at /sitemap.xml
- [ ] Verify robots.txt at /robots.txt
- [ ] Test contact form
- [ ] Test blog listing
- [ ] Test course pages
- [ ] Verify 301 redirects from old URLs
- [ ] Set up Google Analytics (NEXT_PUBLIC_GA_ID)
- [ ] Configure SSL certificate renewal
- [ ] Set up database backups

---

## Environment Variables Reference

See `.env.example` for all required variables.

---

## Monitoring & Logs

```bash
# PM2 logs
pm2 logs recruitmentinstitute

# PM2 status
pm2 status

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database check
psql -h localhost -U riuser -d recruitmentinstitute
```
