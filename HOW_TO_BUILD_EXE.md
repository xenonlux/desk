# 🚀 دليل بناء مقر ديسك كتطبيق EXE باستخدام Tauri

تم إضافة ملفات `src-tauri` اللازمة إلى المشروع. اتبع الخطوات أدناه لبناء ملف `.exe`.

---

## 📋 المتطلبات (تُثبَّت مرة واحدة فقط)

### 1. Node.js (LTS)
- https://nodejs.org

### 2. Rust
```
https://rustup.rs
```
افتح الملف واضغط `1` ثم `Enter`

### 3. C++ Build Tools (لويندوز فقط)
- https://visualstudio.microsoft.com/visual-cpp-build-tools/
- أثناء التثبيت اختر: **Desktop development with C++**

### 4. WebView2 Runtime (مطلوب لويندوز)
- غالباً مثبّت تلقائياً على ويندوز 10/11
- إذا لم يكن: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

> ⚠️ أعد تشغيل الحاسوب بعد تثبيت المتطلبات

---

## 🔨 خطوات البناء

افتح موجه الأوامر (CMD أو PowerShell) داخل مجلد المشروع:

```bash
# 1. تثبيت مكتبات Node
npm install

# 2. بناء وإنتاج ملف EXE
npm run tauri:build
```

---

## 📁 موقع الملف النهائي

بعد انتهاء البناء (قد يستغرق 5-10 دقائق في المرة الأولى):

```
src-tauri\target\release\deskbook.exe          ← تطبيق مباشر
src-tauri\target\release\bundle\msi\           ← مثبّت Windows
src-tauri\target\release\bundle\nsis\          ← مثبّت NSIS
```

---

## ⚡ تشغيل في وضع التطوير (للاختبار)

```bash
npm run tauri:dev
```

---

## 🛠️ ملاحظات هامة

- أول بناء يستغرق وقتاً أطول بسبب تجميع Rust
- النتيجة: ملف `.exe` صغير وسريع يعمل بدون إنترنت
- البيانات تُحفظ في `localStorage` على جهازك محلياً
