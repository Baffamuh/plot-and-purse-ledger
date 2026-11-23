import { describe, expect, it } from "vitest";
import { SAMPLE_SALES, createBackup, getPaymentPlan, parseBackup } from "@/lib/sales";

describe("deposit and batch payments", () => {
  it("treats a deposit with money still owed as a batch payment", () => {
    expect(getPaymentPlan({ agreedPrice: 5_000_000, amountPaid: 2_000_000 })).toBe("Batch payment");
  });
  it("treats a fully paid sale as full payment", () => {
    expect(getPaymentPlan({ agreedPrice: 5_000_000, amountPaid: 5_000_000 })).toBe("Full payment");
  });
});

describe("backup and restore", () => {
  it("restores every record from a valid backup", () => {
    const text = JSON.stringify(createBackup(SAMPLE_SALES, "2026-11-23T08:00:00Z"));
    const result = parseBackup(text);
    expect(result.ok && result.records.length).toBe(SAMPLE_SALES.length);
  });
  it("rejects a backup whose amounts were changed", () => {
    const backup = createBackup(SAMPLE_SALES, "2026-11-23T08:00:00Z");
    const first = backup.records[0];
    if (first) backup.records[0] = { ...first, amountPaid: 1 };
    expect(parseBackup(JSON.stringify(backup)).ok).toBe(false);
  });
  it("rejects a file that is not a backup", () => {
    expect(parseBackup("{}").ok).toBe(false);
  });
});
