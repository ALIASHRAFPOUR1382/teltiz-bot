# Telegram Bot for Tizhooshan Channel Management - Node.js/TypeScript

نسخه Node.js/TypeScript ربات تلگرام مدیریت کانال که با استفاده از Grammy.js نوشته شده است.

## ویژگی‌ها

- **خوش‌آمدگویی خودکار**: پیام‌های خوش‌آمدگویی شخصی‌سازی شده برای اعضای جدید کانال
- **دسته‌بندی کاربران**: دسته‌بندی کاربران (دانش‌آموز پایه ششم، دانش‌آموز پایه نهم، والدین، معلمان) از طریق inline keyboard
- **ارسال هدیه فوری**: ارسال خودکار لینک هدیه پس از انتخاب دسته
- **سیستم کوئیز هفتگی**: سیستم کوئیز تعاملی با امتیازدهی و جدول رده‌بندی
- **اعلان برندگان**: اعلان خودکار 3 نفر برتر کوئیز
- **پنل ادمین**: دستورات برای مدیریت کوئیز و ارسال پیام همگانی

## نیازمندی‌ها

- Node.js 18 یا بالاتر
- Telegram Bot Token (از @BotFather)
- Admin Telegram User IDs

## نصب

1. کلون کردن repository:
```bash
cd robbot_node
```

2. نصب dependencies:
```bash
npm install
```

3. تنظیم متغیرهای محیطی:

یک فایل `.env` در root پروژه ایجاد کنید با محتوای زیر:
```
BOT_TOKEN=your_bot_token_here
ADMIN_IDS=123456789,987654321
CHANNEL_ID=@your_channel_username
WELCOME_GIFT_LINK=https://example.com/welcome-gift.pdf
DATABASE_PATH=bot.db
```

4. راه‌اندازی دیتابیس:
```bash
npm run migrate
```

5. اجرای ربات:
```bash
npm start
```

برای development mode:
```bash
npm run dev
```

## دستورات ادمین

همه دستورات ادمین باید در چت خصوصی با ربات ارسال شوند:

- `/startquiz` - شروع یک کوئیز هفتگی جدید و ارسال اعلان در کانال
- `/endquiz` - پایان کوئیز فعلی و اعلان 3 نفر برتر در کانال
- `/broadcast <پیام>` - ارسال پیام به تمام کاربران ثبت‌نام شده
- `/adminhelp` - نمایش راهنمای دستورات ادمین

## ساختار پروژه

```
robbot_node/
├── src/
│   ├── index.ts                 # Entry point اصلی
│   ├── config/
│   │   └── config.ts            # مدیریت تنظیمات و متغیرهای محیطی
│   ├── database/
│   │   ├── db.ts                # اتصال به دیتابیس
│   │   ├── models.ts            # مدل‌های TypeScript
│   │   ├── migrations.ts        # ایجاد جداول دیتابیس
│   │   └── dbManager.ts         # عملیات دیتابیس (CRUD)
│   ├── handlers/
│   │   ├── start.ts             # Handler برای /start
│   │   ├── welcome.ts           # Handler برای welcome flow
│   │   ├── quiz.ts              # Handler برای quiz system
│   │   ├── admin.ts             # Handler برای دستورات ادمین
│   │   └── callbacks.ts         # Handler برای callback queries
│   ├── keyboards/
│   │   ├── inline.ts            # ساخت inline keyboards
│   │   └── reply.ts             # ساخت reply keyboards
│   ├── services/
│   │   ├── quizService.ts       # منطق quiz و scoring
│   │   ├── userService.ts       # مدیریت کاربران
│   │   └── broadcastService.ts  # ارسال پیام به همه کاربران
│   └── utils/
│       ├── messages.ts          # قالب‌های پیام
│       └── validators.ts        # اعتبارسنجی ورودی‌ها
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── Procfile                     # برای استقرار در لیارا
├── liara.json                   # تنظیمات لیارا
└── README.md
```

## استقرار در لیارا

1. فایل `.env` را در تنظیمات لیارا به عنوان Environment Variables تنظیم کنید
2. پروژه را به لیارا push کنید
3. لیارا به صورت خودکار پروژه را build و deploy می‌کند

## تکنولوژی‌های استفاده شده

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Grammy.js
- **Database**: SQLite با استفاده از @libsql/client
- **Session Storage**: @grammyjs/storage-free (in-memory)

## License

This project is proprietary software.


