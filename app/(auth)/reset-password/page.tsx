export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تخمینو | تعیین رمز جدید" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
