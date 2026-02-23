// app/tools/financial-taste/page.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { toolConfig } from "./tool.config";
import FinancialTasteClient from "./FinancialTasteClient";

export const metadata: Metadata = {
  title: `${toolConfig.title} | تخمینو`,
  description: toolConfig.description,
  alternates: { canonical: toolConfig.path },
  openGraph: {
    title: `${toolConfig.title} | تخمینو`,
    description: toolConfig.description,
    url: toolConfig.path,
    type: "website",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: toolConfig.title,
    description: toolConfig.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: `https://takhmino.com${toolConfig.path}`,
  };

  return (
    <>
      <Script
        id="schema-webapp-financial-taste"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FinancialTasteClient />
    </>
  );
}
