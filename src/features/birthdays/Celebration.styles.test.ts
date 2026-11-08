import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(
  resolve(process.cwd(), "src/features/birthdays/Celebration.module.css"),
  "utf8",
);

function declarationsForSelector(source: string, selector: string) {
  for (const match of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = match[1]
      .split(",")
      .map((candidate) => candidate.trim());

    if (selectors.includes(selector)) {
      return match[2];
    }
  }

  throw new Error(`Missing CSS rule for ${selector}`);
}

function declaration(rule: string, property: string) {
  const match = rule.match(
    new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`),
  );

  if (!match) {
    throw new Error(`Missing ${property} declaration`);
  }

  return match[1].trim();
}

describe("celebration layout styles", () => {
  it("keeps a tall panel top-reachable above and below 480px", () => {
    const baseStyles = styles.split("@media")[0];
    const overlayRule = declarationsForSelector(baseStyles, ".overlay");
    const panelRule = declarationsForSelector(baseStyles, ".panel");

    expect(declaration(overlayRule, "place-items")).toBe("start center");
    expect(declaration(panelRule, "margin-block")).toBe("auto");
  });

  it("removes panel motion when reduced motion is requested", () => {
    const reducedMotion = styles.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)\}\s*$/,
    )?.[1];

    expect(reducedMotion).toBeDefined();
    expect(
      declaration(declarationsForSelector(reducedMotion!, ".panel"), "animation"),
    ).toBe("none");
  });

  it("removes confetti motion when reduced motion is requested", () => {
    const reducedMotion = styles.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)\}\s*$/,
    )?.[1];

    expect(reducedMotion).toBeDefined();
    expect(
      declaration(
        declarationsForSelector(reducedMotion!, ".confetti span"),
        "animation",
      ),
    ).toBe("none");
  });
});
