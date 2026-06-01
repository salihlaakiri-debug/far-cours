import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      rank: string;
      role: "ADMIN" | "INSTRUCTOR" | "USER";
      specialty: string | null;
      militaryId: string;
      academicYear: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rank: string;
    role: "ADMIN" | "INSTRUCTOR" | "USER";
    specialty: string | null;
    militaryId: string;
    academicYear: string | null;
  }
}

export const config: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.id = user.id;
        token.rank = u.rank as string;
        token.role = u.role as "ADMIN" | "INSTRUCTOR" | "USER";
        token.specialty = u.specialty as string | null;
        token.militaryId = u.militaryId as string;
        token.academicYear = u.academicYear as string | null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.rank = token.rank;
      session.user.role = token.role;
      session.user.specialty = token.specialty;
      session.user.militaryId = token.militaryId;
      session.user.academicYear = token.academicYear;
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        name: { label: "الاسم الكامل", type: "text" },
        matricule: { label: "المعرف الرقمي", type: "text" },
        userType: { label: "نوع المستخدم", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.matricule || !credentials?.userType) {
          return null;
        }

        const name = (credentials.name as string).trim();
        const matricule = (credentials.matricule as string).trim().toUpperCase();
        const userType = credentials.userType as string;

        const derivedAcademicYear: Record<string, string> = {
          STUDENT_Y1: "2024-2025",
          STUDENT_Y2: "2025-2026",
          ISTA: "ISTA",
        };

        const isStaff = userType === "ADMIN" || userType === "INSTRUCTOR";

        const roleLookup: Record<string, string> = {
          ADMIN: "ADMIN",
          INSTRUCTOR: "INSTRUCTOR",
        };

        const user = await prisma.user.findUnique({
          where: { militaryId: matricule },
        });

        if (!user) {
          await logAudit({ action: "LOGIN_FAILED", metadata: { matricule, reason: "user_not_found" } });
          return null;
        }

        if (!user.active) {
          await logAudit({ userId: user.id, action: "LOGIN_FAILED", metadata: { matricule, reason: "inactive" } });
          return null;
        }

        if (user.name !== name) {
          await logAudit({ userId: user.id, action: "LOGIN_FAILED", metadata: { matricule, reason: "name_mismatch" } });
          return null;
        }

        if (isStaff) {
          const expectedRole = roleLookup[userType] || userType;
          if (user.role !== expectedRole) {
            await logAudit({ userId: user.id, action: "LOGIN_FAILED", metadata: { matricule, reason: "role_mismatch" } });
            return null;
          }
        } else {
          const expectedAcademicYear = derivedAcademicYear[userType];
          if (!expectedAcademicYear || user.academicYear !== expectedAcademicYear) {
            await logAudit({ userId: user.id, action: "LOGIN_FAILED", metadata: { matricule, reason: "year_mismatch" } });
            return null;
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await logAudit({ userId: user.id, action: "LOGIN_SUCCESS", metadata: { matricule } });

        return {
          id: user.id,
          name: user.name,
          email: null,
          image: null,
          rank: user.rank,
          role: user.role,
          specialty: user.specialty,
          militaryId: user.militaryId,
          academicYear: user.academicYear,
        };
      },
    }),
  ],
};

export async function auth() {
  return getServerSession(config);
}
