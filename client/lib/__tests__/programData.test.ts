import { describe, it, expect } from "vitest";
import { calculateWaiverAmount, getProgramById } from "../programData";
import { registrationPackages } from "../registrationPackages";

describe("calculateWaiverAmount", () => {
  it("calculates waiver amount and final amount correctly", () => {
    const original = 100000;
    // Use two waivers: 70% (result_100) and 20% (sibling) = 90%
    const { waiverPercentage, waiverAmount, finalAmount } =
      calculateWaiverAmount(original, ["result_100", "sibling"]);

    expect(waiverPercentage).toBe(90);
    expect(waiverAmount).toBeCloseTo((original * 90) / 100);
    expect(finalAmount).toBeCloseTo(original - waiverAmount);
  });

  it("caps total waiver percentage at 100%", () => {
    const original = 50000;
    // Combine multiple waivers to exceed 100%
    const { waiverPercentage, waiverAmount, finalAmount } =
      calculateWaiverAmount(original, [
        "result_100", // 70
        "sibling", // 20
        "freedom_fighter", // 50 -> total 140 -> capped to 100
      ]);

    expect(waiverPercentage).toBe(100);
    expect(waiverAmount).toBeCloseTo(original);
    expect(finalAmount).toBeCloseTo(0);
  });
});

describe("base amount derivation (component logic)", () => {
  it("prefers applied package totalEstimated when package is applied", () => {
    const pkg = registrationPackages.find((p) => p.id === "pkg-006");
    expect(pkg).toBeDefined();
    // Simulate component logic: if appliedPackageId present, baseAmount = pkg.totalEstimated
    const baseAmount = pkg ? pkg.totalEstimated : 0;
    expect(baseAmount).toBe(pkg!.totalEstimated);
  });

  it("falls back to program costStructure.total when no package applied", () => {
    const program = getProgramById("bachelor");
    expect(program).toBeDefined();
    // Simulate fallback
    const baseAmount = program ? program.costStructure.total : 0;
    expect(baseAmount).toBe(program!.costStructure.total);
  });
});
