# توثيق API منصة الأستاذ

## 📋 نظرة عامة

هذا هو توثيق API الخاص بمنصة الأستاذ، والتي توفر واجهة برمجة تطبيقات RESTful كاملة لإدارة المحتوى التعليمي.

## 🔗 معلومات أساسية

- **Base URL**: `https://your-backend.vercel.app/api`
- **Format**: JSON
- **Authentication**: JWT Token
- **Content-Type**: `application/json`

## 🔐 المصادقة

### الحصول على Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

### استخدام Token

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📁 نقاط النهاية (Endpoints)

### 1. Authentication

#### تسجيل الدخول
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "الأستاذ أحمد",
    "email": "admin@example.com",
    "subject": "الرياضيات والفيزياء"
  }
}
```

#### معلومات المستخدم
```http
GET /api/auth/me
Authorization: Bearer TOKEN
```

### 2. Lessons (الدروس)

#### الحصول على جميع الدروس
```http
GET /api/lessons
```

**Query Parameters:**
- `level` (optional): مستوى الدرس (مبتدئ، متوسط، متقدم)
- `search` (optional): نص البحث
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج (default: 12)

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid",
      "title": "مقدمة في الجبر",
      "description": "تعلم أساسيات الجبر...",
      "level": "مبتدئ",
      "thumbnail": "url",
      "video_count": 3,
      "file_count": 2,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "pages": 3
  }
}
```

#### الحصول على درس محدد
```http
GET /api/lessons/{id}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "مقدمة في الجبر",
  "description": "...",
  "level": "مبتدئ",
  "videos": [...],
  "files": [...]
}
```

#### إنشاء درس جديد (Protected)
```http
POST /api/lessons
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "title": "عنوان الدرس",
  "description": "وصف الدرس",
  "level": "مبتدئ",
  "thumbnail": "https://..."
}
```

### 3. Videos (الفيديوهات)

#### الحصول على جميع الفيديوهات
```http
GET /api/videos
```

#### إنشاء فيديو جديد (Protected)
```http
POST /api/videos
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "lesson_id": "uuid",
  "title": "عنوان الفيديو",
  "url": "https://youtube.com/watch?v=...",
  "platform": "youtube",
  "duration": 900
}
```

#### تحديث عدد المشاهدات
```http
PUT /api/videos/{id}/view
```

### 4. Files (الملفات)

#### الحصول على جميع الملفات
```http
GET /api/files
```

#### إنشاء ملف جديد (Protected)
```http
POST /api/files
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "lesson_id": "uuid",
  "name": "اسم الملف",
  "url": "https://drive.google.com/...",
  "type": "pdf",
  "size": 2048000
}
```

#### تحديث عدد التحميلات
```http
PUT /api/files/{id}/download
```

### 5. Reviews (التقييمات)

#### الحصول على جميع التقييمات
```http
GET /api/reviews
```

#### إنشاء تقييم جديد
```http
POST /api/reviews
```

**Request Body:**
```json
{
  "student_name": "اسم الطالب",
  "rating": 5,
  "comment": "تعليق الطالب"
}
```

### 6. Messages (الرسائل)

#### الحصول على جميع الرسائل (Protected)
```http
GET /api/messages
Authorization: Bearer TOKEN
```

#### إرسال رسالة
```http
POST /api/messages
```

**Request Body:**
```json
{
  "student_name": "اسم الطالب",
  "phone": "0501234567",
  "email": "email@example.com",
  "content": "نص الرسالة"
}
```

#### تحديد الرسالة كمقروءة (Protected)
```http
PUT /api/messages/{id}/read
Authorization: Bearer TOKEN
```

### 7. Dashboard (لوحة التحكم)

#### الإحصائيات
```http
GET /api/dashboard/stats
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "lessons": 25,
  "videos": 100,
  "files": 50,
  "reviews": 150,
  "messages": 75,
  "unreadMessages": 12,
  "totalViews": 12500,
  "totalDownloads": 3200,
  "averageRating": 4.8
}
```

#### الرسائل الأخيرة
```http
GET /api/dashboard/recent-messages
Authorization: Bearer TOKEN
```

#### التقييمات الأخيرة
```http
GET /api/dashboard/recent-reviews
Authorization: Bearer TOKEN
```

#### التحليلات
```http
GET /api/dashboard/analytics?period=7d
Authorization: Bearer TOKEN
```

## 🎯 أمثلة الاستخدام

### JavaScript (Fetch API)

```javascript
// تسجيل الدخول
const login = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password'
    })
  });
  
  const data = await response.json();
  const token = data.token;
  
  // استخدام Token في الطلبات اللاحقة
  const lessons = await fetch('/api/lessons', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

### Python (Requests)

```python
import requests

# تسجيل الدخول
response = requests.post('https://api.example.com/api/auth/login', json={
    'email': 'admin@example.com',
    'password': 'password'
})

token = response.json()['token']

# الحصول على الدروس
headers = {'Authorization': f'Bearer {token}'}
lessons = requests.get('https://api.example.com/api/lessons', headers=headers)
```

## 📋 رموز الحالة

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 معالجة الأخطاء

### خطأ في المصادقة
```json
{
  "error": "Invalid credentials"
}
```

### خطأ في البيانات
```json
{
  "error": "Title and level are required"
}
```

### خطأ عام
```json
{
  "error": "Something went wrong!",
  "message": "Detailed error message"
}
```

## 📚 نصائح وأفضل الممارسات

1. **التحقق من الأخطاء**: دائماً تحقق من رموز الحالة قبل معالجة الاستجابة
2. **الحد من الطلبات**: استخدم معلمات `page` و`limit` للتحكم في عدد النتائج
3. **التخزين المؤقت**: خزن Token بطريقة آمنة (localStorage/sessionStorage)
4. **معالجة الأخطاء**: استخدم try-catch للتعامل مع الأخطاء بشكل صحيح
5. **التحقق من الصحة**: تحقق من صحة البيانات قبل إرسالها إلى API

## 🆕 التحديثات

تابع هذا الملف للحصول على أحدث التحديثات والتغييرات في API.

---

لأي أسئلة أو مشاكل، يرجى فتح Issue في المستودع أو التواصل مع فريق الدعم.