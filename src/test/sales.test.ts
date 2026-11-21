import { describe, expect, it } from "vitest";

import {
  SAMPLE_SALES,
  calculateBalance,
  filterSales,
  type SaleFilters,
} from "@/lib/sales";

describe("sales worksheet rules", () => {
  it("calculates the outstanding balance without allowing a negative amount", () => {
    expect(calculateBalance(7_800_000, 3_000_000)).toBe(4_800_000);
    expect(calculateBalance(7_800_000, 8_000_000)).toBe(0);
  });

  it("filters by agent phone, payment status, and location", () => {
    const filters: SaleFilters = {
      query: "+234 813",
      propertyType: "",
      paymentStatus: "Deposit",
      agent: "",
      location: "Fatara",
      startDate: "",
      endDate: "",
    };

    expect(filterSales(SAMPLE_SALES, filters).map((sale) => sale.buyerName)).toEqual([
      "Bilkisu Umar",
    ]);
  });
});