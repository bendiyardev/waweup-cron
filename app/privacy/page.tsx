"use client";

import Link from "next/link";
import { TopControls, useI18n } from "@/components/site-chrome";
import { PRIVACY_KEYS } from "@/lib/dict";
import { SITE } from "@/lib/site";

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <main className="flex flex-1 flex-col px-4 pb-10 pt-3 sm:pb-16">
      <TopControls />

      <div className="mt-10 flex flex-col items-center sm:mt-16">
        <div className="w-full max-w-[620px]">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("privacyTitle")}
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {SITE.name} · {SITE.domain}
            </p>
          </header>

          <section className="w-full rounded-2xl border border-border bg-card p-[18px] sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="space-y-4">
              {PRIVACY_KEYS.map((k) => (
                <p key={k} className="text-[13px] leading-relaxed text-secondary">
                  {t(k)}
                </p>
              ))}
            </div>
          </section>

          <footer className="mt-8 text-center">
            <Link
              href="/"
              className="text-[13px] text-muted transition-colors hover:text-foreground"
            >
              ← {SITE.name}
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
