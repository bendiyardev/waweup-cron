"use client";

import Link from "next/link";
import Tool from "@/components/tool";
import Faq from "@/components/faq";
import { TopControls, useI18n } from "@/components/site-chrome";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="flex flex-1 flex-col px-4 pb-10 pt-3 sm:pb-16">
      <TopControls />

      <div className="mt-10 flex flex-col items-center sm:mt-16">
        <div className="w-full max-w-[620px]">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-sm text-secondary">{t("subtitle")}</p>
          </header>

          <Tool />

          <Faq />

          <footer className="mt-8 flex items-center justify-center gap-2 text-center">
            <p className="text-[13px] text-muted">{t("footer")}</p>
            <span className="text-[13px] text-muted">·</span>
            <Link
              href="/privacy"
              className="text-[13px] text-muted transition-colors hover:text-foreground"
            >
              {t("privacyLink")}
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
