import { describe, expect, it } from "vitest";
import { describeCron, nextRuns, parseCron } from "@/lib/cron";

describe("parseCron", () => {
  it("parses a full wildcard expression", () => {
    const s = parseCron("* * * * *");
    expect(s.minute.size).toBe(60);
    expect(s.hour.size).toBe(24);
    expect(s.dom.size).toBe(31);
    expect(s.month.size).toBe(12);
    expect(s.dow.size).toBe(7);
  });

  it("parses steps, ranges, lists and names", () => {
    const s = parseCron("*/15 9-17 1,15 JAN,JUL MON-FRI");
    expect([...s.minute].sort((a, b) => a - b)).toEqual([0, 15, 30, 45]);
    expect(s.hour.has(9)).toBe(true);
    expect(s.hour.has(17)).toBe(true);
    expect(s.hour.has(8)).toBe(false);
    expect([...s.dom].sort((a, b) => a - b)).toEqual([1, 15]);
    expect([...s.month].sort((a, b) => a - b)).toEqual([1, 7]);
    expect([...s.dow].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it("maps day-of-week 7 to Sunday (0)", () => {
    const s = parseCron("0 0 * * 7");
    expect(s.dow.has(0)).toBe(true);
  });

  it("rejects out-of-range and malformed fields", () => {
    expect(() => parseCron("61 * * * *")).toThrow();
    expect(() => parseCron("* 24 * * *")).toThrow();
    expect(() => parseCron("* * 0 * *")).toThrow();
    expect(() => parseCron("* * * 13 *")).toThrow();
    expect(() => parseCron("a * * * *")).toThrow();
    expect(() => parseCron("* * * *")).toThrow();
    expect(() => parseCron("*/0 * * * *")).toThrow();
    expect(() => parseCron("5-2 * * * *")).toThrow();
  });
});

describe("nextRuns", () => {
  // 2026-08-24 is a Monday.
  const from = new Date("2026-08-24T10:07:00Z");

  it("computes quarter-hour runs in UTC", () => {
    const runs = nextRuns("*/15 * * * *", 3, from, "UTC");
    expect(runs.map((d) => d.toISOString())).toEqual([
      "2026-08-24T10:15:00.000Z",
      "2026-08-24T10:30:00.000Z",
      "2026-08-24T10:45:00.000Z",
    ]);
  });

  it("computes a yearly run", () => {
    const runs = nextRuns("0 0 1 1 *", 1, from, "UTC");
    expect(runs[0].toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("respects weekday restrictions", () => {
    // 09:30 Mon-Fri; from Monday 10:07 → next is Tuesday 09:30.
    const runs = nextRuns("30 9 * * MON-FRI", 2, from, "UTC");
    expect(runs[0].toISOString()).toBe("2026-08-25T09:30:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-08-26T09:30:00.000Z");
  });

  it("uses OR semantics when both dom and dow are restricted", () => {
    // day 26 of month OR Tuesday; from Mon Aug 24 → Tue Aug 25 (dow), then Wed Aug 26 (dom).
    const runs = nextRuns("0 12 26 * TUE", 2, from, "UTC");
    expect(runs[0].toISOString()).toBe("2026-08-25T12:00:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-08-26T12:00:00.000Z");
  });

  it("honours timezones", () => {
    // 09:00 in Istanbul (UTC+3) is 06:00 UTC.
    const runs = nextRuns("0 9 * * *", 1, from, "Europe/Istanbul");
    expect(runs[0].toISOString()).toBe("2026-08-25T06:00:00.000Z");
  });
});

describe("describeCron", () => {
  it("describes common expressions in English", () => {
    expect(describeCron("* * * * *", "en")).toBe("Every minute");
    expect(describeCron("*/5 * * * *", "en")).toBe("Every 5 minutes");
    expect(describeCron("30 9 * * 1-5", "en")).toContain("09:30");
    expect(describeCron("30 9 * * 1-5", "en")).toContain("Monday");
    expect(describeCron("0 0 1 1 *", "en")).toContain("January");
  });

  it("describes common expressions in Turkish", () => {
    expect(describeCron("* * * * *", "tr")).toBe("Her dakika");
    expect(describeCron("*/5 * * * *", "tr")).toBe("Her 5 dakikada bir");
    expect(describeCron("30 9 * * 1-5", "tr")).toContain("Pazartesi");
  });
});
