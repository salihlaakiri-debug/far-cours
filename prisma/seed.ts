import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function createPrisma() {
  if (process.env.TURSO_DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql/web");
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

const specialty = { name: "المدرعات", slug: "armor", order: 1 };

interface Subject {
  title: string;
  description: string;
}

interface Year {
  name: string;
  slug: string;
  subjects: Subject[];
}

const years: Year[] = [
  {
    name: "السنة الأولى",
    slug: "premiere-annee",
    subjects: [
      { title: "Armement", description: "التسليح — connaissance des armes et systèmes d'armement" },
      { title: "Simulateur de conduite", description: "محاكاة القيادة — entraînement sur simulateur de pilotage" },
      { title: "Connaissance mécanique", description: "المعرفة الميكانيكية — mécanique générale des blindés" },
      { title: "EPS", description: "التربية البدنية والرياضية — éducation physique et sportive" },
      { title: "Code de la Route", description: "قانون السير — code de la route militaire" },
      { title: "École de Soldat", description: "مدرسة الجندي — formation militaire de base" },
    ],
  },
  {
    name: "السنة الثانية",
    slug: "deuxieme-annee",
    subjects: [
      { title: "Systèmes de drones", description: "أنظمة الطائرات بدون طيار — systèmes de drones tactiques" },
      { title: "École de Soldat", description: "مدرسة الجندي — perfectionnement militaire" },
      { title: "Règlement", description: "النظام العام — règlement militaire et discipline" },
      { title: "Leadership", description: "القيادة — commandement et leadership" },
      { title: "Transmissions", description: "المواصلات — radiocommunications et transmissions" },
      { title: "PC", description: "Poste de Commandement — مركز القيادة" },
      { title: "Correspondance Militaire", description: "المراسلات العسكرية — correspondance administrative" },
      { title: "Identification", description: "التعريف — identification des véhicules et matériels" },
      { title: "Cyber-Sécurité", description: "الأمن السيبراني — cybersécurité militaire" },
      { title: "Français", description: "اللغة الفرنسية — langue française technique" },
      { title: "Génie", description: "الهندسة — génie militaire" },
    ],
  },
];

async function main() {
  console.log("Seeding school structure: 2 years / 17 subjects");

  const upsertUser = async (data: { militaryId: string; name: string; rank: string; academicYear: string; role: string }) => {
    await prisma.user.upsert({
      where: { militaryId: data.militaryId },
      update: { name: data.name, rank: data.rank, academicYear: data.academicYear, role: data.role },
      create: data,
    });
  };

  await upsertUser({ militaryId: "ADMIN001", name: "مدير النظام", rank: "مدير", academicYear: "2025-2026", role: "ADMIN" });
  console.log("Admin: ADMIN001");

  await upsertUser({ militaryId: "USER001", name: "مستخدم تجريبي", rank: "جندي", academicYear: "2025-2026", role: "USER" });
  console.log("User: USER001");

  await upsertUser({ militaryId: "Y1001", name: "تلميذ سنة أولى", rank: "تلميذ", academicYear: "2024-2025", role: "USER" });
  console.log("Student Y1: Y1001");

  await upsertUser({ militaryId: "Y2001", name: "تلميذ سنة ثانية", rank: "تلميذ", academicYear: "2025-2026", role: "USER" });
  console.log("Student Y2: Y2001");

  await upsertUser({ militaryId: "IS001", name: "متدرب ISTA", rank: "متدرب", academicYear: "ISTA", role: "USER" });
  console.log("ISTA: IS001");

  // Clean old data
  await prisma.enrollment.deleteMany();
  await prisma.instructorAssignment.deleteMany();
  await prisma.lessonSchedule.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.specialty.deleteMany();

  const spec = await prisma.specialty.create({ data: specialty });
  console.log(`Specialty: ${spec.name}`);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  for (const yr of years) {
    const branch = await prisma.branch.create({
      data: { specialtyId: spec.id, name: yr.name, slug: yr.slug },
    });

    for (let i = 0; i < yr.subjects.length; i++) {
      const subj = yr.subjects[i];
      const pdfKey = `${spec.slug}/${yr.slug}/${subj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      const pdfDir = path.join(uploadsDir, spec.slug, yr.slug);
      fs.mkdirSync(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `${subj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);

      if (!fs.existsSync(pdfPath)) {
        fs.writeFileSync(pdfPath, "%PDF-1.4 sample placeholder");
      }

      await prisma.lesson.create({
        data: {
          branchId: branch.id,
          academicYear: "2025-2026",
          title: subj.title,
          description: subj.description,
          pdfKey,
          pdfSize: fs.statSync(pdfPath).size,
          order: i + 1,
        },
      });
    }
    console.log(`  ${yr.name} — ${yr.subjects.length} matières`);
  }

  // Academic period
  const period = await prisma.academicPeriod.upsert({
    where: { slug: "cycle-2026-1" },
    update: {},
    create: {
      name: "الدورة الأولى 2026",
      slug: "cycle-2026-1",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
    },
  });
  console.log(`Period: ${period.name}`);

  // Instructor
  await upsertUser({ militaryId: "INST001", name: "أستاذ المدرعات", rank: "نقيب", academicYear: "2025-2026", role: "INSTRUCTOR" });
  console.log("Instructor: INST001");

  // Assign instructor to both years
  const inst = await prisma.user.findUnique({ where: { militaryId: "INST001" } });
  const trainee = await prisma.user.findUnique({ where: { militaryId: "USER001" } });
  const branches = await prisma.branch.findMany({ where: { specialtyId: spec.id } });

  if (inst) {
    for (const branch of branches) {
      await prisma.instructorAssignment.upsert({
        where: { instructorId_branchId_academicPeriodId: { instructorId: inst.id, branchId: branch.id, academicPeriodId: period.id } },
        update: {},
        create: { instructorId: inst.id, branchId: branch.id, academicPeriodId: period.id },
      });
    }
    console.log(`Instructor assigned to ${branches.length} years`);
  }

  // Enroll trainee
  if (trainee && inst) {
    await prisma.enrollment.upsert({
      where: { userId_academicPeriodId: { userId: trainee.id, academicPeriodId: period.id } },
      update: {},
      create: { userId: trainee.id, instructorId: inst.id, academicPeriodId: period.id },
    });
    console.log(`Trainee enrolled in ${period.name}`);
  }

  // Schedule lessons
  const allLessons = await prisma.lesson.findMany({
    include: { branch: true },
    orderBy: [{ branchId: "asc" }, { order: "asc" }],
  });
  const periodStart = new Date("2026-01-01");
  for (let i = 0; i < allLessons.length; i++) {
    const lesson = allLessons[i];
    const sDate = new Date(periodStart);
    sDate.setDate(sDate.getDate() + i * 7);
    const eDate = new Date(sDate);
    eDate.setDate(eDate.getDate() + 5);
    await prisma.lessonSchedule.upsert({
      where: { lessonId_academicPeriodId: { lessonId: lesson.id, academicPeriodId: period.id } },
      update: {},
      create: { lessonId: lesson.id, academicPeriodId: period.id, startDate: sDate, endDate: eDate, sessionCount: 3 },
    });
  }
  console.log(`${allLessons.length} lessons scheduled`);

  // ── Schedule Template ──
  const tplBranches = await prisma.branch.findMany({ orderBy: { id: "asc" } });
  if (tplBranches.length > 0) {
    const tpl = await prisma.scheduleTemplate.create({
      data: {
        branchId: tplBranches[0].id,
        name: "Template Sécurité Militaire",
        description: "قالب أسبوعي نموذجي",
      },
    });

    const templateSessions = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "11:00", title: "SM1", instructorName: "LT BOUSSELHAM", room: "Amphi EODR 2A", sessionNum: 1 },
      { dayOfWeek: 1, startTime: "11:00", endTime: "12:00", title: "SM2", instructorName: "CNE EN-NAHNAHI", room: "Amphi EODR 2A", sessionNum: 2 },
      { dayOfWeek: 1, startTime: "14:00", endTime: "15:00", title: "SM2 (suite)", instructorName: "CNE EN-NAHNAHI", room: "", sessionNum: 2, isContinuation: true },
      { dayOfWeek: 1, startTime: "15:00", endTime: "16:00", title: "SM3", instructorName: "CNE EN-NAHNAHI", room: "Amphi EODR 2A", sessionNum: 3 },
      { dayOfWeek: 2, startTime: "10:00", endTime: "11:00", title: "SM3 (suite)", instructorName: "CNE EN-NAHNAHI", room: "", sessionNum: 3, isContinuation: true },
      { dayOfWeek: 2, startTime: "11:00", endTime: "12:00", title: "SM4", instructorName: "CNE EN-NAHNAHI", room: "Amphi EODR 2A", sessionNum: 4 },
      { dayOfWeek: 2, startTime: "15:00", endTime: "16:00", title: "SM5", instructorName: "CNE EN-NAHNAHI", room: "Amphi EODR 2A", sessionNum: 5 },
      { dayOfWeek: 3, startTime: "10:00", endTime: "12:00", title: "SM6", instructorName: "CNE EN-NAHNAHI", room: "", sessionNum: 6 },
      { dayOfWeek: 3, startTime: "12:00", endTime: "14:00", title: "SM7", instructorName: "CNE EN-NAHNAHI", room: "Amphi EODR 2A", sessionNum: 7 },
      { dayOfWeek: 4, startTime: "10:00", endTime: "12:00", title: "SM8", instructorName: "CNE AYANE", room: "", sessionNum: 8 },
      { dayOfWeek: 4, startTime: "12:00", endTime: "13:00", title: "SM9", instructorName: "LT BOUSSELHAM", room: "Amphi EODR 2A", sessionNum: 9 },
      { dayOfWeek: 4, startTime: "14:00", endTime: "16:00", title: "SM10", instructorName: "CNE AYANE", room: "Amphi EODR 2A", sessionNum: 10 },
      { dayOfWeek: 5, startTime: "10:00", endTime: "12:00", title: "SM12", instructorName: "5e bureau EMG", room: "Amphi EODR 2A", sessionNum: 12 },
    ];

    for (const ts of templateSessions) {
      await prisma.templateSession.create({ data: { templateId: tpl.id, ...ts } });
    }
    console.log(`Template: ${tpl.name} (${templateSessions.length} sessions)`);

    // Create published weeks from template (3 consecutive weeks)
    async function createWeek(weekStartDate: Date) {
      const week = await prisma.weeklySchedule.create({
        data: {
          branchId: tplBranches[0].id,
          templateId: tpl.id,
          weekStart: weekStartDate,
          status: "PUBLISHED",
          publishedAt: new Date(),
          createdBy: inst?.id || "seed",
        },
      });
      for (const ts of templateSessions) {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + (ts.dayOfWeek - 1));
        await prisma.session.create({
          data: {
            weeklyScheduleId: week.id,
            instructorName: ts.instructorName,
            room: ts.room,
            date: d,
            startTime: ts.startTime,
            endTime: ts.endTime,
            title: ts.title,
            sessionNum: ts.sessionNum,
            isContinuation: ts.isContinuation || false,
          },
        });
      }
      console.log(`Published week: ${weekStartDate.toISOString().slice(0, 10)} (${templateSessions.length} sessions)`);
    }

    await createWeek(new Date("2026-05-11"));
    await createWeek(new Date("2026-05-18"));
    await createWeek(new Date("2026-05-25"));
  }

  console.log("Seed complete! 2 ans, 17 matières + planning.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
