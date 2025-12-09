# النشر على Vercel

دليل شامل لنشر منصة الأستاذ على Vercel

## 📋 المتطلبات

- حساب Vercel (مجاني)
- مستودع GitHub/GitLab/Bitbucket
- Node.js 18+

## 🚀 خطوات النشر

### 1. إعداد المشروع

```bash
# تأكد من أن المشروع جاهز
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. نشر Frontend

#### طريقة 1: عبر Vercel Dashboard

1. سجل دخول إلى [Vercel](https://vercel.com)
2. اضغط "New Project"
3. اربط حساب Git الخاص بك
4. اختر المستودع الخاص بـ teacher-platform
5. قم بالإعدادات التالية:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. أضف Environment Variables:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   REACT_APP_API_URL=your_backend_url
   ```
7. اضغط "Deploy"

#### طريقة 2: عبر CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# في مجلد frontend
cd frontend

# نشر المشروع
vercel --prod

# اتبع التعليمات
# اختر إعدادات المشروع:
# - Framework: React
# - Root Directory: frontend
# - Build Command: npm run build
# - Output Directory: build
```

### 3. نشر Backend

#### إعداد ملف vercel.json

أنشئ ملف `vercel.json` في مجلد backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "15mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### نشر Backend

```bash
# في مجلد backend
cd backend

# نشر المشروع
vercel --prod

# أضف Environment Variables:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# JWT_SECRET=your_jwt_secret
```

## 🔧 إعدادات المشروع

### Frontend (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rootDirectory": "frontend"
}
```

### Backend (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

## 📋 Environment Variables

### Frontend
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://your-backend.vercel.app/api
```

### Backend
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🔍 استكشاف الأخطاء

### مشاكل شائعة

1. **Build Failed**
   - تأكد من أن `package.json` يحتوي على جميع dependencies
   - تحقق من أن `build` script موجود
   - تأكد من أن `tailwind.config.js` صحيح

2. **Environment Variables**
   - تأكد من إضافة جميع المتغيرات المطلوبة
   - تحقق من أن أسماء المتغيرات صحيحة
   - تأكد من أن القيم لا تحتوي على مسافات

3. **CORS Issues**
   - أضف Frontend URL إلى متغير `FRONTEND_URL`
   - تأكد من إعدادات CORS في Backend

4. **Supabase Connection**
   - تحقق من أن المفاتيح صحيحة
   - تأكد من أن RLS (Row Level Security) مضبوط بشكل صحيح

### أدوات التصحيح

```bash
# عرض سجلات التطبيق
vercel logs your-app.vercel.app

# التحقق من البناء
vercel build

# التشغيل المحلي
vercel dev
```

## 🎯 أفضل الممارسات

### الأداء
- استخدم Code Splitting
- ضغط الصور قبل الرفع
- استخدم Lazy Loading للمكونات
- قلل من حجم الحزم (bundles)

### الأمان
- لا تضع sensitive keys في Frontend
- استخدم Environment Variables للمفاتيح
- فعل HTTPS دائماً
- استخدم Content Security Policy

### SEO
- أضف meta tags
- استخدم Semantic HTML
- أنشئ sitemap.xml
- أضف robots.txt

## 📊 المراقبة

### Analytics
- Vercel Analytics (مجاني)
- Google Analytics
- Mixpanel

### Performance
- Lighthouse CI
- Web Vitals
- Speed Insights

## 🔄 التحديثات

### التحديث التلقائي
عند دفع (push) تغييرات إلى Git:
1. Vercel يكتشف التغييرات تلقائياً
2. يبدأ عملية البناء
3. ينشر النسخة الجديدة

### التحديث اليدوي
```bash
# في حالة الحاجة للنشر اليدوي
vercel --prod --force
```

## 💰 التكلفة

### الخطة المجانية
- 100GB Bandwidth
- 100GB Build Execution
- 6000 Edge Functions
- 100GB Database

### عند الحاجة للترقية
- حسب الاستخدام الفعلي
- يمكنك تعيين حدود الإنفاق

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من [Vercel Documentation](https://vercel.com/docs)
2. راجع [React Documentation](https://reactjs.org/docs)
3. افتح Issue في المستودع
4. تواصل معنا على support@teacher-platform.com

## 🎉 تهانينا!

تم الآن نشر منصتك على Vercel بنجاح. يمكنك الوصول إليها عبر:
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`

---

**ملاحظة**: تأكد من مراجعة إعدادات الأمان قبل الاستخدام الفعلي.