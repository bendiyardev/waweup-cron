// Standard 5-field cron parsing, human-readable description and next-run
// preview. Provider-specific formats (Quartz seconds, @yearly, L/W/#) are
// intentionally unsupported.

export type CronError = {
  field: "minute" | "hour" | "dom" | "month" | "dow" | "expression";
  reason: "fields" | "syntax" | "range" | "step";
  detail: string;
};

export class CronParseError extends Error {
  info: CronError;
  constructor(info: CronError) {
    super(`${info.field}: ${info.detail}`);
    this.info = info;
  }
}

export type CronSchedule = {
  minute: Set<number>;
  hour: Set<number>;
  dom: Set<number>;
  month: Set<number>;
  dow: Set<number>;
  domRestricted: boolean;
  dowRestricted: boolean;
  raw: string[];
};

const MONTH_NAMES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const DOW_NAMES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

type FieldSpec = {
  name: CronError["field"];
  min: number;
  max: number;
  names?: Record<string, number>;
  wrapSeven?: boolean;
};

const FIELDS: FieldSpec[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "dom", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: MONTH_NAMES },
  { name: "dow", min: 0, max: 7, names: DOW_NAMES, wrapSeven: true },
];

function parseValue(token: string, spec: FieldSpec): number {
  const named = spec.names?.[token.toLowerCase()];
  if (named !== undefined) return named;
  if (!/^\d+$/.test(token)) {
    throw new CronParseError({
      field: spec.name,
      reason: "syntax",
      detail: `"${token}" is not a number or a known name`,
    });
  }
  const n = Number(token);
  if (n < spec.min || n > spec.max) {
    throw new CronParseError({
      field: spec.name,
      reason: "range",
      detail: `${n} is outside ${spec.min}-${spec.max}`,
    });
  }
  return n;
}

function parseField(field: string, spec: FieldSpec): Set<number> {
  const out = new Set<number>();
  if (field.length === 0) {
    throw new CronParseError({
      field: spec.name,
      reason: "syntax",
      detail: "empty field",
    });
  }
  for (const part of field.split(",")) {
    let body = part;
    let step = 1;
    const stepIdx = part.indexOf("/");
    if (stepIdx !== -1) {
      body = part.slice(0, stepIdx);
      const stepStr = part.slice(stepIdx + 1);
      if (!/^\d+$/.test(stepStr) || Number(stepStr) === 0) {
        throw new CronParseError({
          field: spec.name,
          reason: "step",
          detail: `invalid step "/${stepStr}"`,
        });
      }
      step = Number(stepStr);
    }
    let lo: number;
    let hi: number;
    if (body === "*") {
      lo = spec.min;
      hi = spec.max;
    } else if (body.includes("-")) {
      const [a, b] = body.split("-");
      lo = parseValue(a, spec);
      hi = parseValue(b, spec);
      if (lo > hi) {
        throw new CronParseError({
          field: spec.name,
          reason: "range",
          detail: `range ${lo}-${hi} is reversed`,
        });
      }
    } else {
      lo = parseValue(body, spec);
      hi = lo;
      if (stepIdx !== -1) hi = spec.max; // e.g. "5/15" → from 5 with step
    }
    for (let v = lo; v <= hi; v += step) {
      out.add(spec.wrapSeven && v === 7 ? 0 : v);
    }
  }
  return out;
}

export function parseCron(expression: string): CronSchedule {
  const raw = expression.trim().split(/\s+/);
  if (raw.length !== 5) {
    throw new CronParseError({
      field: "expression",
      reason: "fields",
      detail: `expected 5 fields, got ${raw.length}`,
    });
  }
  const [minute, hour, dom, month, dow] = FIELDS.map((spec, i) =>
    parseField(raw[i], spec)
  );
  return {
    minute,
    hour,
    dom,
    month,
    dow,
    domRestricted: raw[2] !== "*",
    dowRestricted: raw[4] !== "*",
    raw,
  };
}

type TzParts = {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  dow: number;
};

const DOW_FROM_NAME: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function tzFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hourCycle: "h23",
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

export function partsInTz(date: Date, timeZone: string): TzParts {
  const parts = tzFormatter(timeZone).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";
  return {
    y: Number(get("year")),
    mo: Number(get("month")),
    d: Number(get("day")),
    h: Number(get("hour")) % 24,
    mi: Number(get("minute")),
    dow: DOW_FROM_NAME[get("weekday")] ?? 0,
  };
}

function dayMatches(s: CronSchedule, p: TzParts): boolean {
  const domOk = s.dom.has(p.d);
  const dowOk = s.dow.has(p.dow);
  if (s.domRestricted && s.dowRestricted) return domOk || dowOk;
  if (s.domRestricted) return domOk;
  if (s.dowRestricted) return dowOk;
  return true;
}

const MINUTE = 60_000;

export function nextRuns(
  expression: string,
  count: number,
  from: Date = new Date(),
  timeZone = "UTC"
): Date[] {
  const s = parseCron(expression);
  const runs: Date[] = [];
  // Start at the next whole minute.
  let t = Math.floor(from.getTime() / MINUTE) * MINUTE + MINUTE;
  for (let iter = 0; iter < 200_000 && runs.length < count; iter++) {
    const p = partsInTz(new Date(t), timeZone);
    if (!s.month.has(p.mo) || !dayMatches(s, p)) {
      // Jump to (approximately) the next local midnight.
      t += ((23 - p.h) * 60 + (60 - p.mi)) * MINUTE;
      continue;
    }
    if (!s.hour.has(p.h)) {
      t += (60 - p.mi) * MINUTE;
      continue;
    }
    if (!s.minute.has(p.mi)) {
      t += MINUTE;
      continue;
    }
    runs.push(new Date(t));
    t += MINUTE;
  }
  return runs;
}

// ---------------------------------------------------------------------------
// Human-readable description (EN + TR)
// ---------------------------------------------------------------------------

const EN_DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TR_DOW = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const EN_MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TR_MONTH = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function listJoin(items: string[], lang: "en" | "tr"): string {
  if (items.length === 1) return items[0];
  const and = lang === "en" ? " and " : " ve ";
  return items.slice(0, -1).join(", ") + and + items[items.length - 1];
}

function sorted(set: Set<number>): number[] {
  return [...set].sort((a, b) => a - b);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function describeCron(expression: string, lang: "en" | "tr"): string {
  const s = parseCron(expression);
  const [minRaw, hourRaw, , monthRaw] = s.raw;
  const en = lang === "en";

  // Time phrase
  let time: string;
  const minStep = /^\*\/(\d+)$/.exec(minRaw);
  const hourStep = /^\*\/(\d+)$/.exec(hourRaw);
  const minutes = sorted(s.minute);
  const hours = sorted(s.hour);

  if (minRaw === "*" && hourRaw === "*") {
    time = en ? "Every minute" : "Her dakika";
  } else if (minStep && hourRaw === "*") {
    time = en
      ? `Every ${minStep[1]} minutes`
      : `Her ${minStep[1]} dakikada bir`;
  } else if (hourRaw === "*") {
    const m = listJoin(minutes.map(String), lang);
    time = en
      ? `At minute ${m} past every hour`
      : `Her saatin ${m}. dakikasında`;
  } else if (minRaw === "*") {
    const h = listJoin(hours.map(String), lang);
    time = en
      ? `Every minute during hour ${h}`
      : `Saat ${h} boyunca her dakika`;
  } else if (hourStep) {
    const m = listJoin(minutes.map(String), lang);
    time = en
      ? `At minute ${m} past every ${hourStep[1]} hours`
      : `Her ${hourStep[1]} saatte bir, ${m}. dakikada`;
  } else if (minutes.length === 1 && hours.length <= 3) {
    const times = hours.map((h) => `${pad(h)}:${pad(minutes[0])}`);
    time = en ? `At ${listJoin(times, lang)}` : `Saat ${listJoin(times, lang)}'de`;
  } else {
    const m = listJoin(minutes.map(String), lang);
    const h = listJoin(hours.map(String), lang);
    time = en
      ? `At minute ${m} past hour ${h}`
      : `Saat ${h}, dakika ${m}'de`;
  }

  const phrases: string[] = [time];

  // Day phrase
  const dowNames = en ? EN_DOW : TR_DOW;
  if (s.domRestricted && s.dowRestricted) {
    const doms = listJoin(sorted(s.dom).map(String), lang);
    const dows = listJoin(sorted(s.dow).map((d) => dowNames[d]), lang);
    phrases.push(
      en
        ? `on day ${doms} of the month or on ${dows}`
        : `ayın ${doms}. günü veya ${dows} günleri`
    );
  } else if (s.domRestricted) {
    const doms = listJoin(sorted(s.dom).map(String), lang);
    phrases.push(en ? `on day ${doms} of the month` : `ayın ${doms}. günü`);
  } else if (s.dowRestricted) {
    const dows = listJoin(sorted(s.dow).map((d) => dowNames[d]), lang);
    phrases.push(en ? `on ${dows}` : `${dows} günleri`);
  }

  // Month phrase
  if (monthRaw !== "*") {
    const monthNames = en ? EN_MONTH : TR_MONTH;
    const months = listJoin(sorted(s.month).map((m) => monthNames[m]), lang);
    phrases.push(en ? `in ${months}` : `${months} ayında`);
  }

  return phrases.join(en ? ", " : ", ");
}
