// app/(public)/layout.tsx
import type { ReactNode } from "react";
import AppShell from "@/app/_shell/AppShell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell surface="light" chrome="public">
      {children}
    </AppShell>
  );
}