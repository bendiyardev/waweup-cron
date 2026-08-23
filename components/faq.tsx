"use client";

import { useI18n } from "@/components/site-chrome";
import { FAQ_ITEMS } from "@/lib/dict";

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-muted transition-transform duration-150 group-open:rotate-180 group-open:text-[#ff6903]"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Faq() {
  const { t } = useI18n();

  return (
    <section className="mt-8 w-full rounded-2xl border border-border bg-card px-[18px] sm:px-6 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="pt-4 pb-1 text-sm font-semibold tracking-tight text-foreground">
        {t("faqTitle")}
      </h2>
      <div className="divide-y divide-border">
        {FAQ_ITEMS.map(({ q, a }) => (
          <details key={q} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-3 text-sm font-medium text-foreground transition-colors hover:text-[#ff6903] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border [&::-webkit-details-marker]:hidden">
              {t(q)}
              <ChevronIcon />
            </summary>
            <p className="px-1 pb-4 text-[13px] leading-relaxed text-secondary">
              {t(a)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
