"use client";

import { ToastProvider } from "./ToastProvider";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
