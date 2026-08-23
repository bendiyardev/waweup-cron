"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dict, type DictKey, type Lang } from "@/lib/dict";

// ---------------------------------------------------------------------------
// Language store — external so SSR renders "en" and the client corrects the
// value right after hydration without cascading effect renders.
// ---------------------------------------------------------------------------

let langValue: Lang | null = null;
const langListeners = new Set<() => void>();

function langSubscribe(cb: () => void): () => void {
  langListeners.add(cb);
  return () => {
    langListeners.delete(cb);
  };
}

function langSnapshot(): Lang {
  if (langValue === null) {
    let resolved: Lang = "en";
    try {
      const stored = localStorage.getItem("waweup-lang");
      if (stored === "tr" || stored === "en") {
        resolved = stored;
      } else if (navigator.language?.toLowerCase().startsWith("tr")) {
        resolved = "tr";
      }
    } catch {
      // Storage unavailable; keep default.
    }
    langValue = resolved;
  }
  return langValue;
}

function langServerSnapshot(): Lang {
  return "en";
}

function setLangStore(next: Lang) {
  langValue = next;
  try {
    localStorage.setItem("waweup-lang", next);
  } catch {
    // Storage unavailable; ignore.
  }
  for (const cb of langListeners) cb();
}

// ---------------------------------------------------------------------------
// Theme store — the DOM class is the source of truth (set pre-hydration by the
// inline script in layout.tsx).
// ---------------------------------------------------------------------------

const themeListeners = new Set<() => void>();

function themeSubscribe(cb: () => void): () => void {
  themeListeners.add(cb);
  return () => {
    themeListeners.delete(cb);
  };
}

function themeSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function themeServerSnapshot(): boolean {
  return false;
}

function toggleThemeStore() {
  const root = document.documentElement;
  const next = !root.classList.contains("dark");
  root.classList.toggle("dark", next);
  try {
    localStorage.setItem("waweup-theme", next ? "dark" : "light");
  } catch {
    // Storage unavailable; ignore.
  }
  for (const cb of themeListeners) cb();
}

// ---------------------------------------------------------------------------

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <SiteChrome>");
  }
  return ctx;
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    langSubscribe,
    langSnapshot,
    langServerSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangStore(next);
  }, []);

  const t = useCallback((key: DictKey) => dict[lang][key], [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function ArrowLeftIcon() {
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
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function TopControls() {
  const { lang, setLang, t } = useI18n();
  const dark = useSyncExternalStore(
    themeSubscribe,
    themeSnapshot,
    themeServerSnapshot
  );

  const langSegment =
    "h-full rounded-md px-2.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border";

  return (
    <header className="flex w-full items-center gap-2 py-2">
      {/* LEFT: back link + language toggle */}
      <div className="flex items-center gap-2">
        <a
          href="https://waweup.com"
          aria-label={t("backAria")}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[13px] font-medium text-secondary transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          <ArrowLeftIcon />
          <span className="hidden sm:inline">waweup.com</span>
        </a>

        <div
          role="group"
          aria-label={t("langAria")}
          className="flex h-8 items-center gap-0.5 rounded-lg border border-border bg-card p-0.5"
        >
          <button
            type="button"
            aria-pressed={lang === "tr"}
            onClick={() => setLang("tr")}
            className={`${langSegment} ${
              lang === "tr"
                ? "bg-[#ff6903] text-white"
                : "text-secondary hover:bg-hover"
            }`}
          >
            TR
          </button>
          <button
            type="button"
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
            className={`${langSegment} ${
              lang === "en"
                ? "bg-[#ff6903] text-white"
                : "text-secondary hover:bg-hover"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* CENTER: logo */}
      <div className="flex flex-1 justify-center">
        <Link
          href="/"
          aria-label="waweup"
          className="inline-flex items-center rounded-md text-lg font-semibold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          <span>wawe</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF6903"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="ml-[2px] size-[0.85em] -translate-y-[0.06em] -rotate-12"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </Link>
      </div>

      {/* RIGHT: theme toggle */}
      <button
        type="button"
        onClick={toggleThemeStore}
        aria-label={dark ? t("themeToLight") : t("themeToDark")}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-secondary transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}
