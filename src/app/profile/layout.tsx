import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AppShell
      user={{
        name: session.user.name,
        rank: session.user.rank,
        role: session.user.role,
        militaryId: session.user.militaryId,
      }}
      showBottomNav={session.user.role !== "ADMIN"}
    >
      {children}
    </AppShell>
  );
}
