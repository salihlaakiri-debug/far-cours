import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SpecialtyNav() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    include: {
      branches: {
        include: { _count: { select: { lessons: true } } },
      },
    },
  });

  return (
    <nav className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialty) => (
          <div
            key={specialty.id}
            className="rounded-lg border border-[#334155] bg-[#1e293b] p-5 shadow-sm"
          >
            <h2 className="mb-3 text-lg font-bold text-[#d4a843]">{specialty.name}</h2>
            <div className="space-y-1">
              {specialty.branches.map((branch) => (
                <Link
                  key={branch.id}
                  href={`/${specialty.slug}/${branch.slug}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] transition-colors"
                >
                  <span>{branch.name}</span>
                  <span className="text-xs text-[#64748b]">
                    {branch._count.lessons} درس
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
