// app/(dark)/layout.tsx
import type { ReactNode } from "react";
import AppShell from "@/app/_shell/AppShell";

export default function DarkLayout({ children }: { children: ReactNode }) {
  return <AppShell surface="dark">{children}</AppShell>;
}