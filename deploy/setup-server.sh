#!/usr/bin/env bash
set -e

# ============================================
# FAR Lessons Platform — Server Setup Script
# Tested on: Ubuntu 22.04 / 24.04
# Run as root or with sudo
# ============================================

DOMAIN="far.local"          # ← CHANGE THIS
APP_DIR="/var/www/far"
APP_USER="far"
NODE_VERSION="26"

echo "=== FAR Lessons Platform — Server Setup ==="

# --- 1. System dependencies ---
apt update
apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# --- 2. Node.js (via NodeSource) ---
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs
npm install -g pm2

# --- 3. Create user & directory ---
id -u $APP_USER &>/dev/null || useradd -m -s /bin/bash $APP_USER
mkdir -p $APP_DIR
mkdir -p $APP_DIR/public/uploads
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/pids

# --- 4. Deploy app code ---
# Option A: Clone from git
# git clone https://github.com/your-org/far-lessons.git $APP_DIR
#
# Option B: Copy files manually (SCP / rsync)
# rsync -avz --exclude node_modules --exclude .next ./ $APP_USER@server:$APP_DIR

# --- 5. Install dependencies ---
cd $APP_DIR
npm ci
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# --- 6. Build ---
npm run build

# --- 7. Environment file ---
cat > $APP_DIR/.env <<EOF
NODE_ENV=production
DATABASE_URL="file:${APP_DIR}/prisma/prod.db"
AUTH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_URL="https://${DOMAIN}"
AUTH_URL="https://${DOMAIN}"
NEXT_PUBLIC_APP_URL="https://${DOMAIN}"
EOF

# --- 8. PM2 startup ---
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# --- 9. Nginx ---
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --- 10. SSL certificate (requires DNS pointing to this server) ---
# certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@${DOMAIN}

# --- 11. Permissions ---
chown -R $APP_USER:$APP_USER $APP_DIR

echo ""
echo "=== Setup complete! ==="
echo "App:     https://${DOMAIN}"
echo "PM2:     pm2 list"
echo "Logs:    pm2 logs far-app"
echo "Restart: pm2 restart far-app"
echo ""
echo "Run certbot manually after DNS is configured:"
echo "  certbot --nginx -d ${DOMAIN}"
