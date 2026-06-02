interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const badgeVariants = {
  default: "bg-[#334155]/50 text-[#64748b]",
  success: "bg-[#22c55e]/10 text-[#22c55e]",
  warning: "bg-[#f59e0b]/10 text-[#f59e0b]",
  danger: "bg-[#ef4444]/10 text-[#ef4444]",
  info: "bg-[#2563eb]/10 text-[#2563eb]",
  gold: "bg-[#d4a843]/10 text-[#d4a843]",
};

const badgeSizes = {
  sm: "px-1.5 py-0.5 text-[9px]",
  md: "px-2 py-0.5 text-[10px]",
};

export function Badge({ variant = "default", size = "md", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md font-bold tracking-wider ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
