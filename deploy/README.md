# FAR Lessons — نشر التطبيق

## هيكل الملفات

```
deploy/
├── README.md              ← هذا الملف
├── nginx.conf             ← إعدادات Nginx للخادم
└── setup-server.sh        ← سكربت إعداد الخادم آلياً (Ubuntu)

ecosystem.config.js        ← إعدادات PM2 (مدير العمليات)
.env.production            ← متغيرات البيئة للإنتاج
```

## طريقة النشر

### 1. على الخادم (Ubuntu)

```bash
# رفع الملفات إلى الخادم
rsync -avz --exclude node_modules --exclude .next --exclude prisma/dev.db \
  ./ user@server:/var/www/far/

# أو استنساخ من Git
git clone https://github.com/your-org/far-lessons.git /var/www/far

# تشغيل سكربت الإعداد
cd /var/www/far
sudo bash deploy/setup-server.sh
```

### 2. يدوياً (تفصيلي)

```bash
# 1. تثبيت الاعتماديات
npm ci
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 2. بناء التطبيق
npm run build

# 3. إنشاء مجلدات
mkdir -p logs pids public/uploads

# 4. ضبط متغيرات البيئة
# انسخ .env.production إلى .env وعدّل القيم

# 5. تشغيل التطبيق
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. إعداد Nginx + SSL

```bash
# انسخ إعدادات Nginx
cp deploy/nginx.conf /etc/nginx/sites-available/far.local
ln -s /etc/nginx/sites-available/far.local /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# شهادة SSL (Let's Encrypt)
certbot --nginx -d far.local
```

## التحديثات

```bash
git pull
npm ci
npx prisma db push
npm run build
pm2 restart far-app
```

## حسابات الاختبار

| المستخدم | الاسم | السنة | MATRICULE |
|---------|-------|-------|-----------|
| مدير | مدير النظام | 2025-2026 | ADMIN001 |
| مستخدم | مستخدم تجريبي | 2025-2026 | USER001 |
| أستاذ | أستاذ المدرعات | 2025-2026 | INST001 |
