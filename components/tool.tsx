"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/site-chrome";
import { CronParseError, describeCron, nextRuns } from "@/lib/cron";

type Mode = "build" | "explain";

type FieldKey = "minute" | "hour" | "dom" | "month" | "dow";

const FIELD_ORDER: FieldKey[] = ["minute", "hour", "dom", "month", "dow"];

const FIELD_PRESETS: Record<FieldKey, { value: string; label: string }[]> = {
  minute: [
    { value: "*", label: "*" },
    { value: "0", label: ":00" },
    { value: "15", label: ":15" },
    { value: "30", label: ":30" },
    { value: "*/5", label: "*/5" },
    { value: "*/15", label: "*/15" },
    { value: "*/30", label: "*/30" },
  ],
  hour: [
    { value: "*", label: "*" },
    { value: "0", label: "00" },
    { value: "6", label: "06" },
    { value: "9", label: "09" },
    { value: "12", label: "12" },
    { value: "18", label: "18" },
    { value: "*/2", label: "*/2" },
    { value: "*/6", label: "*/6" },
  ],
  dom: [
    { value: "*", label: "*" },
    { value: "1", label: "1" },
    { value: "15", label: "15" },
  ],
  month: [
    { value: "*", label: "*" },
    { value: "1", label: "JAN" },
    { value: "6", label: "JUN" },
    { value: "12", label: "DEC" },
  ],
  dow: [
    { value: "*", label: "*" },
    { value: "1-5", label: "MON-FRI" },
    { value: "0,6", label: "SAT,SUN" },
    { value: "1", label: "MON" },
  ],
};

const FIELD_LABEL_KEY = {
  minute: "fieldMinute",
  hour: "fieldHour",
  dom: "fieldDom",
  month: "fieldMonth",
  dow: "fieldDow",
} as const;

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
}

export default function Tool() {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<Mode>("build");
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    minute: "*/15",
    hour: "*",
    dom: "*",
    month: "*",
    dow: "*",
  });
  const [custom, setCustom] = useState<Record<FieldKey, boolean>>({
    minute: false,
    hour: false,
    dom: false,
    month: false,
    dow: false,
  });
  const [explainInput, setExplainInput] = useState("30 9 * * MON-FRI");
  const [timezone, setTimezone] = useState("UTC");
  const [copied, setCopied] = useState(false);
  // `nextRuns` depends on the current time, which differs between the SSR
  // render and client hydration — computing it during render causes a
  // hydration mismatch (React #418). Defer it until after mount.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Deferred (async) so this runs after hydration commits, avoiding both the
    // set-state-in-effect lint rule and the time-based hydration mismatch.
    const id = setTimeout(() => {
      let tz = "UTC";
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        // keep UTC
      }
      setTimezone(tz);
      setNow(new Date());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const timezones = useMemo(() => getTimezones(), []);

  const expression =
    mode === "build"
      ? FIELD_ORDER.map((k) => fields[k].trim() || "*").join(" ")
      : explainInput.trim();

  const result = useMemo(() => {
    if (expression.length === 0) return null;
    try {
      const description = describeCron(expression, lang);
      // Only compute time-dependent runs after mount (now !== null).
      const runs = now ? nextRuns(expression, 8, now, timezone) : [];
      return { description, runs, error: null as string | null };
    } catch (err) {
      const detail =
        err instanceof CronParseError
          ? `${err.info.field}: ${err.info.detail}`
          : "syntax error";
      return { description: "", runs: [] as Date[], error: detail };
    }
  }, [expression, lang, timezone, now]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; ignore.
    }
  }, [expression]);

  const runFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
        timeZone: timezone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    [lang, timezone]
  );

  const segmentBase =
    "h-8 rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border";
  const segmentActive =
    "bg-card text-foreground border border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)]";
  const segmentInactive = "text-secondary hover:text-foreground";

  const inputCls =
    "h-9 w-full rounded-lg border border-border bg-card px-2.5 font-mono text-[13px] text-foreground outline-none transition-colors focus:border-muted";

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-[18px] sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Mode tabs */}
      <div
        className="grid grid-cols-2 gap-1 rounded-lg bg-hover p-1"
        role="tablist"
        aria-label={t("modeAria")}
      >
        {(["build", "explain"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`${segmentBase} ${mode === m ? segmentActive : segmentInactive}`}
          >
            {m === "build" ? t("modeBuild") : t("modeExplain")}
          </button>
        ))}
      </div>

      {mode === "build" ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {FIELD_ORDER.map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {t(FIELD_LABEL_KEY[key])}
              </label>
              {custom[key] ? (
                <input
                  value={fields[key]}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className={inputCls}
                  spellCheck={false}
                />
              ) : (
                <select
                  value={
                    FIELD_PRESETS[key].some((p) => p.value === fields[key])
                      ? fields[key]
                      : "__custom"
                  }
                  onChange={(e) => {
                    if (e.target.value === "__custom") {
                      setCustom((c) => ({ ...c, [key]: true }));
                    } else {
                      setFields((f) => ({ ...f, [key]: e.target.value }));
                    }
                  }}
                  className={`${inputCls} appearance-none`}
                >
                  {FIELD_PRESETS[key].map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                  <option value="__custom">{t("optCustom")}</option>
                </select>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {t("expressionLabel")}
          </label>
          <input
            value={explainInput}
            onChange={(e) => setExplainInput(e.target.value)}
            placeholder={t("expressionPlaceholder")}
            className={`${inputCls} mt-1.5`}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      )}

      {/* Expression display + copy */}
      <div className="mt-4 flex items-center gap-2">
        <code className="flex h-9 flex-1 items-center overflow-x-auto rounded-lg border border-border bg-hover px-3 font-mono text-[13px] text-foreground">
          {expression || "—"}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-9 items-center rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-secondary transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>

      {result?.error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {t("invalidPrefix")}: <span className="font-mono">{result.error}</span>
        </p>
      ) : result ? (
        <>
          <div className="mt-4">
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted">
              {t("explanationTitle")}
            </h3>
            <p className="mt-1 text-sm text-foreground">{result.description}</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {t("nextRunsTitle")}
              </h3>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                aria-label={t("timezoneLabel")}
                className="h-8 max-w-[220px] appearance-none rounded-lg border border-border bg-card px-2 text-[12px] text-secondary outline-none focus:border-muted"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
              {result.runs.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-2 font-mono text-[13px] text-foreground"
                >
                  <span>{runFormatter.format(d)}</span>
                  <span className="text-[11px] text-muted">#{i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        {t("unsupportedNote")}
      </p>
    </div>
  );
}
