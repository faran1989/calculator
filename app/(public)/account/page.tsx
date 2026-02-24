import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "تخمینو | حساب کاربری",
};

export default function Page() {
  return <AccountClient />;
}