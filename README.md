# نظام إدارة الدورات والحضور بالباركود

نظام ويب لإدارة الدورات التدريبية وتسجيل الحضور عبر مسح الباركود (QR Code).

## المميزات

- ✅ إدارة الدورات (إضافة/تعديل/حذف)
- ✅ توليد باركود QR فريد لكل دورة
- ✅ صفحة تسجيل حضور عامة
- ✅ منع التسجيل المتكرر من نفس الجهاز
- ✅ لوحة تحكم محمية بتسجيل دخول
- ✅ تصدير بيانات الحضور CSV

## التقنيات

- Next.js 16
- TypeScript
- Prisma + SQLite
- NextAuth.js
- QR Code Generation

## التشغيل محلياً

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

## بيانات الدخول الافتراضية

- **اسم المستخدم:** admin
- **كلمة المرور:** admin123

## متغيرات البيئة

```env
DATABASE_URL="file:./data/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.railway.app"
NEXT_PUBLIC_BASE_URL="https://your-domain.railway.app"
```
