import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "تخمینو | فراموشی رمز عبور" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
