// app/(auth)/layout.tsx
import type { ReactNode } from "react";
import AppShell from "@/app/_shell/AppShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AppShell surface="light">{children}</AppShell>;
}