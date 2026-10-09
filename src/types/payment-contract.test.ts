import { describe, it, expect } from "vitest";
import { ASSETS, formatBaseUnits, toBaseUnits } from "./payment-contract";

describe("toBaseUnits", () => {
  it.each([
    ["1.5", 6, "1500000"],
    ["1.15", 6, "1150000"], // 1.15 * 1e6 is 1149999.9999999998 in floats
    ["0.000001", 6, "1"],
    ["0.00000001", 8, "1"],
    ["21000000", 8, "2100000000000000"],
    ["007.10", 6, "7100000"],
    ["5.", 6, "5000000"],
    [" 2 ", 6, "2000000"],
  ])("%j with %i decimals is %s", (human, decimals, base) => {
    expect(toBaseUnits(human, decimals)).toBe(base);
  });

  it.each([
    "",
    "0",
    "0.000000",
    "-1",
    "+1",
    "1e6",
    "1,5",
    ".5",
    "abc",
    "1.0000001", // 7 decimals for a 6-decimal asset
    "10000000000000", // 1e19 base units, above u64 range
  ])("rejects %j for a 6-decimal asset", (human) => {
    expect(() => toBaseUnits(human, 6)).toThrow();
  });
});

describe("formatBaseUnits", () => {
  it.each([
    ["1500000", 6, "1.5"],
    ["1", 6, "0.000001"],
    ["1", 8, "0.00000001"],
    ["100000000", 8, "1"],
    ["0", 6, "0"],
  ])("%s with %i decimals is %s", (base, decimals, human) => {
    expect(formatBaseUnits(base, decimals)).toBe(human);
  });

  it.each(Object.entries(ASSETS))(
    "round-trips through toBaseUnits for %s",
    (_unit, { decimals }) => {
      for (const base of ["1", "10", "1000000", "123456789", "999999999999999999"]) {
        expect(toBaseUnits(formatBaseUnits(base, decimals), decimals)).toBe(base);
      }
    },
  );
});
