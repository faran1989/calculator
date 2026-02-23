import { Suspense } from "react";
import CheckEmailContent from "./CheckEmailContent";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
