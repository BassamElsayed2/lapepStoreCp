This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🎉 تحديثات حديثة - نظام المنتجات

تم تحويل نظام إدارة المنتجات من Supabase إلى SQL Server! 🚀

### 📚 الوثائق الجديدة:
- **[CHANGES-SUMMARY.md](./CHANGES-SUMMARY.md)** - ملخص سريع للتغييرات
- **[MIGRATION-TO-SQL-SERVER.md](./MIGRATION-TO-SQL-SERVER.md)** - دليل كامل للتحويل والإعداد
- **[TEST-PRODUCTS-API.md](./TEST-PRODUCTS-API.md)** - دليل اختبار شامل
- **[API-FIELDS-MAPPING.md](./API-FIELDS-MAPPING.md)** - 🆕 مطابقة الحقول بين Dashboard و Backend
- **[CHANGELOG.md](./CHANGELOG.md)** - سجل التغييرات والتحديثات

### 🔑 النقاط الرئيسية:
- ✅ البيانات الآن في **SQL Server** (أداء أفضل)
- ✅ الصور لا تزال على **Supabase Storage** (bucket: `product-images`)
- ✅ نفس تجربة المستخدم - لا تغييرات في الواجهة
- ✅ توافقية كاملة مع الكود القديم

### 🚀 البدء السريع:
```bash
# 1. تأكد من تشغيل Backend API
cd ../backend && npm run dev

# 2. شغّل Dashboard
npm run dev

# 3. افتح المتصفح على http://localhost:3000
```

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
