# PROJECT_MAP.md — منصة دروس القوات المسلحة الملكية (سلاح المدرعات)

## [TECH_STACK]
- **Next.js** 15.5.18 (App Router)
- **NextAuth** v4.24.14 (Credentials provider — name + academicYear + matricule, no password)
- **SQLite** via `better-sqlite3` + **Prisma ORM** 7.8.0 (with `@prisma/adapter-better-sqlite3`)
- **react-pdf** 10.4.1 (pdfjs-dist 5.7.284)
- **Tailwind CSS** v4.3.0 (RTL, Arabic UI, dark military theme)
- **Local file storage** (`public/uploads/`) — no S3/MinIO
- **PM2** process manager for production (ecosystem.config.js)
- **Cloudflare Tunnel** (trycloudflare.com) for temporary public access
- **PWA** — manifest.json (standalone, RTL, dark), service worker (cache-first pages)

## [SYSTEM_FLOW]
Login (name + academicYear dropdown + matricule)
→ Dashboard (حسب الصلاحية)
→ اختيار التخصص → الشعبة → الدرس
→ PDF Viewer مع تتبع التقدم (debounced save)

## [ARCHITECTURE]
```
cours/
├── prisma/
│   ├── schema.prisma          # 14 models (User, Specialty, Branch, Lesson, …)
│   ├── seed.ts                # Seed data: 2 levels × 17 matières + schedule
│   └── dev.db                 # SQLite database
├── public/
│   ├── uploads/               # PDF files stored locally
│   ├── ERB.png                # Logo
│   ├── manifest.json          # PWA manifest
│   └── pdf.worker.min.mjs     # PDF.js worker
├── deploy/
│   ├── nginx.conf             # Nginx reverse proxy config
│   └── setup-server.sh        # Server setup script
├── mobile/                    # Expo/React Native mobile app
│   ├── src/screens/LoginScreen.tsx  # 3-field login
│   └── src/api.ts             # API client
├── start-prod.ps1             # Production startup (PM2 + tunnel)
├── schtasks-setup.ps1         # Windows scheduled task registration
├── get-tunnel-url.ps1         # Get current tunnel URL
└── ecosystem.config.js        # PM2 configuration
```

## [ADMIN MODULES]
- **Dashboard** — stats cards, quick actions, ERB logo sidebar
- **Specialties** — CRUD (name, slug)
- **Branches** — CRUD (per specialty, name, slug)
- **Lessons** — upload PDF (branch + academicYear + title + description), list, delete
- **Schedule (Weeks)** — create/publish/copy weeks, drag-and-drop session grid editor, conflict checker
- **Schedule (Templates)** — reusable session templates
- **Users** — manage users with academicYear

## [DATABASE MODELS]
- **User**: id, militaryId, name, rank, academicYear?, role (ADMIN/USER/INSTRUCTOR), …
- **Specialty**: id, name, slug (unique), order
- **Branch**: id, specialtyId, name, slug (unique per specialty)
- **Lesson**: id, branchId, academicYear?, title, description, pdfKey, pdfSize, pageCount, order
- **UserProgress**: id, userId, lessonId, lastPage, totalPages, completedAt, viewCount (unique per user+lesson)
- **AcademicPeriod**: id, name, slug (unique), startDate, endDate, isActive
- **InstructorAssignment**: instructorId, branchId, academicPeriodId (unique 3-way)
- **Enrollment**: userId, instructorId?, academicPeriodId (unique per user+period)
- **LessonSchedule**: lessonId, academicPeriodId, startDate, endDate, sessionCount (unique per lesson+period)
- **ScheduleTemplate**: id, branchId, name, description
- **TemplateSession**: id, templateId, lessonId?, dayOfWeek, startTime, endTime, title, sessionType, …
- **WeeklySchedule**: id, branchId, weekStart, status (DRAFT/PUBLISHED/ARCHIVED), createdBy
- **Session**: id, weeklyScheduleId, lessonId?, instructorName?, room, date, startTime, endTime, title, sessionType, …
- **AuditLog**: id, userId, action, metadata, ip, userAgent

## [AUTH]
- No password — credentials provider matches name + academicYear + matricule only
- JWT session (8h expiry) with academicYear in token
- Middleware protects /admin → ADMIN only, /instructor → INSTRUCTOR + ADMIN
- API routes use `getApiAuth()` helper (reads Bearer token from NextAuth session)

## [DEPLOYMENT]
- Local: `npm run dev` → http://localhost:3000
- Production: `start-prod.ps1` → PM2 (server) + Cloudflare Tunnel (public)
- Windows startup: `schtasks-setup.ps1` registers scheduled task
- Tunnel URL saved to `current-tunnel-url.txt`, changes on each restart

## [CREDENTIALS (no password)]
- ADMIN: `مدير النظام` / `2025-2026` / `ADMIN001`
- USER: `مستخدم تجريبي` / `2025-2026` / `USER001`
- INSTRUCTOR: `أستاذ المدرعات` / `2025-2026` / `INST001`
- Active period: `الدورة الأولى 2026` (01/01/2026 — 30/06/2026)

## [MILESTONES]
- ✅ **M1** — Auth + DB (SQLite, Prisma, NextAuth, local storage)
- ✅ **M2** — Admin CRUD (Specialty, Branch, Lesson) + PDF upload
- ✅ **M3** — Dashboard + lesson navigation + PDF viewer with progress
- ✅ **M4** — Academic structure (branches, specialties, academic periods)
- ✅ **M5** — Schedule system (templates, weekly grids, DnD editor, conflict detection, copy/publish)
- ✅ **M6** — PWA (manifest, service worker, standalone mode)
- ✅ **M7** — Mobile app (Expo, 3-field login)
- 🔄 **M8** — Tunnel + production deployment (start-prod.ps1, PM2, cloudflared)

## [KEY FILES]
- `src/app/api/upload/route.ts` — PDF upload (100MB limit, .pdf only)
- `src/components/PDFViewer.tsx` — PDF viewer with page nav, zoom, fullscreen, progress
- `src/app/api/schedule/weeks/[weekId]/publish/route.ts` — publish week
- `src/app/api/schedule/weeks/[weekId]/copy/route.ts` — copy week with sessions
- `src/components/ScheduleConflictChecker.tsx` — conflict detection UI
- `src/lib/storage/index.ts` — local file storage abstraction
