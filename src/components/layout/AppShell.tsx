import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    rank: string;
    role: string;
    militaryId: string;
  };
  showBottomNav?: boolean;
  onToggleSidebar?: () => void;
}

export function AppShell({ children, user, showBottomNav = true, onToggleSidebar }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0f172a]" dir="rtl">
      <TopBar user={user} onToggleSidebar={onToggleSidebar} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      {showBottomNav && <BottomNav role={user.role} />}
      {showBottomNav && <div className="h-16 sm:hidden" />}
    </div>
  );
}
