# دليل نشر موقع FarsDos Games على سيرفر خاص

## المتطلبات الأساسية

### 1. متطلبات السيرفر
- **نظام التشغيل**: Ubuntu 20.04+ أو CentOS 8+
- **الذاكرة**: 2GB RAM كحد أدنى
- **المساحة**: 20GB مساحة فارغة
- **المعالج**: 1 CPU core كحد أدنى

### 2. البرامج المطلوبة
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js و npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت Nginx
sudo apt install nginx -y

# تثبيت PM2 لإدارة التطبيقات
sudo npm install -g pm2

# تثبيت Git
sudo apt install git -y
```

## خطوات النشر

### الخطوة 1: تحضير الملفات

#### أ) إنشاء ملف البناء
```bash
# في مجلد المشروع المحلي
npm run build
```

#### ب) ضغط الملفات
```bash
# ضغط مجلد dist والملفات المطلوبة
tar -czf farsdos-games.tar.gz dist/ package.json package-lock.json
```

### الخطوة 2: رفع الملفات للسيرفر

#### أ) باستخدام SCP
```bash
# رفع الملفات المضغوطة
scp farsdos-games.tar.gz username@your-server-ip:/home/username/

# الاتصال بالسيرفر
ssh username@your-server-ip
```

#### ب) باستخدام FTP/SFTP
```bash
# استخدام FileZilla أو WinSCP
# رفع الملف المضغوط إلى مجلد /var/www/
```

### الخطوة 3: إعداد السيرفر

#### أ) إنشاء مجلد التطبيق
```bash
# إنشاء مجلد للموقع
sudo mkdir -p /var/www/farsdos-games
sudo chown $USER:$USER /var/www/farsdos-games

# نقل وفك ضغط الملفات
cd /var/www/farsdos-games
tar -xzf ~/farsdos-games.tar.gz
```

#### ب) إعداد متغيرات البيئة
```bash
# إنشاء ملف .env
nano .env
```

```env
# محتوى ملف .env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=production
PORT=3000
```

### الخطوة 4: إعداد Nginx

#### أ) إنشاء ملف التكوين
```bash
sudo nano /etc/nginx/sites-available/farsdos-games
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/farsdos-games/dist;
    index index.html;
    
    # ضغط الملفات
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # التعامل مع ملفات SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # تخزين مؤقت للملفات الثابتة
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # أمان إضافي
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### ب) تفعيل الموقع
```bash
# ربط ملف التكوين
sudo ln -s /etc/nginx/sites-available/farsdos-games /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### الخطوة 5: إعداد SSL (اختياري ولكن مُوصى به)

#### أ) تثبيت Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### ب) الحصول على شهادة SSL
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### الخطوة 6: إعداد قاعدة البيانات Supabase

#### أ) إعداد CORS في Supabase
1. اذهب إلى لوحة تحكم Supabase
2. اختر مشروعك
3. اذهب إلى Settings > API
4. في قسم CORS origins، أضف:
   ```
   https://your-domain.com
   https://www.your-domain.com
   ```

#### ب) إعداد RLS Policies
```sql
-- التأكد من تفعيل RLS على جميع الجداول
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
```

## إعداد النسخ الاحتياطي

### 1. نسخ احتياطي للملفات
```bash
# إنشاء سكريبت النسخ الاحتياطي
sudo nano /usr/local/bin/backup-farsdos.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/farsdos-games"
DATE=$(date +%Y%m%d_%H%M%S)

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

# نسخ ملفات الموقع
tar -czf $BACKUP_DIR/farsdos-$DATE.tar.gz /var/www/farsdos-games/

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "farsdos-*.tar.gz" -mtime +30 -delete

echo "Backup completed: farsdos-$DATE.tar.gz"
```

```bash
# جعل السكريبت قابل للتنفيذ
sudo chmod +x /usr/local/bin/backup-farsdos.sh

# إضافة مهمة مجدولة (كل يوم في الساعة 2 صباحاً)
sudo crontab -e
# أضف هذا السطر:
0 2 * * * /usr/local/bin/backup-farsdos.sh
```

## مراقبة الأداء

### 1. إعداد مراقبة Nginx
```bash
# تفعيل سجلات الوصول
sudo nano /etc/nginx/sites-available/farsdos-games
```

```nginx
# إضافة هذه الأسطر داخل server block
access_log /var/log/nginx/farsdos-access.log;
error_log /var/log/nginx/farsdos-error.log;
```

### 2. مراقبة استخدام الموارد
```bash
# تثبيت htop لمراقبة النظام
sudo apt install htop -y

# مراقبة مساحة القرص
df -h

# مراقبة الذاكرة
free -h
```

## استكشاف الأخطاء

### 1. مشاكل شائعة وحلولها

#### أ) خطأ 502 Bad Gateway
```bash
# فحص حالة Nginx
sudo systemctl status nginx

# فحص سجلات الأخطاء
sudo tail -f /var/log/nginx/error.log
```

#### ب) مشاكل الصلاحيات
```bash
# إصلاح صلاحيات الملفات
sudo chown -R www-data:www-data /var/www/farsdos-games
sudo chmod -R 755 /var/www/farsdos-games
```

#### ج) مشاكل CORS
```bash
# فحص headers في المتصفح
# أو استخدام curl
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-supabase-url.supabase.co/rest/v1/games
```

## تحديث الموقع

### 1. سكريبت التحديث التلقائي
```bash
sudo nano /usr/local/bin/update-farsdos.sh
```

```bash
#!/bin/bash
SITE_DIR="/var/www/farsdos-games"
BACKUP_DIR="/backup/farsdos-games"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting update process..."

# إنشاء نسخة احتياطية
echo "Creating backup..."
tar -czf $BACKUP_DIR/pre-update-$DATE.tar.gz $SITE_DIR/

# تحديث الملفات (يجب رفع الملفات الجديدة مسبقاً)
echo "Updating files..."
cd $SITE_DIR
# هنا يمكن إضافة أوامر git pull إذا كنت تستخدم Git

# إعادة تشغيل الخدمات
echo "Restarting services..."
sudo systemctl reload nginx

echo "Update completed successfully!"
```

## الأمان

### 1. إعداد Firewall
```bash
# تثبيت وإعداد UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 2. تحديثات الأمان
```bash
# إعداد التحديثات التلقائية
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. مراقبة السجلات
```bash
# مراقبة محاولات الدخول المشبوهة
sudo tail -f /var/log/auth.log

# مراقبة سجلات Nginx
sudo tail -f /var/log/nginx/access.log
```

## ملاحظات مهمة

1. **النسخ الاحتياطي**: تأكد من إجراء نسخ احتياطية منتظمة
2. **التحديثات**: حافظ على تحديث النظام والبرامج
3. **المراقبة**: راقب أداء الموقع واستخدام الموارد
4. **الأمان**: استخدم كلمات مرور قوية وفعّل المصادقة الثنائية
5. **SSL**: استخدم شهادات SSL دائماً للمواقع الإنتاجية

## الدعم الفني

في حالة مواجهة مشاكل:
1. فحص سجلات النظام: `sudo journalctl -xe`
2. فحص سجلات Nginx: `sudo tail -f /var/log/nginx/error.log`
3. فحص حالة الخدمات: `sudo systemctl status nginx`
4. اختبار التكوين: `sudo nginx -t`