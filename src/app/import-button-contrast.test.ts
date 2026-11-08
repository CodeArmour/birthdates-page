import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(
  resolve(process.cwd(), "src/app/globals.css"),
  "utf8",
);
const dashboardStyles = readFileSync(
  resolve(
    process.cwd(),
    "src/features/birthdays/BirthdayDashboard.module.css",
  ),
  "utf8",
);

function getRule(styles: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  if (!match) {
    throw new Error(`Missing CSS rule: ${selector}`);
  }

  return match[1];
}

function getDeclaration(rule: string, property: string) {
  const match = rule.match(new RegExp(`(?:^|\\n)\\s*${property}\\s*:\\s*([^;]+);`));

  if (!match) {
    throw new Error(`Missing CSS declaration: ${property}`);
  }

  return match[1].trim();
}

function resolveColor(value: string): string {
  if (value === "white") {
    return "#ffffff";
  }

  const variable = value.match(/^var\((--[^)]+)\)$/)?.[1];

  if (variable) {
    const match = globalStyles.match(
      new RegExp(`${variable}\\s*:\\s*(#[0-9a-f]{3,6})\\s*;`, "i"),
    );

    if (!match) {
      throw new Error(`Missing CSS color token: ${variable}`);
    }

    return match[1];
  }

  if (/^#[0-9a-f]{3,6}$/i.test(value)) {
    return value;
  }

  throw new Error(`Unsupported CSS color value: ${value}`);
}

function relativeLuminance(hexColor: string) {
  const hex = hexColor.slice(1);
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character.repeat(2))
          .join("")
      : hex;
  const channels = expanded
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(firstColor: string, secondColor: string) {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe("import action contrast", () => {
  it("keeps the primary import action at WCAG AA contrast", () => {
    const importButtonRule = getRule(dashboardStyles, ".importButton");
    const foreground = resolveColor(getDeclaration(importButtonRule, "color"));
    const background = resolveColor(
      getDeclaration(importButtonRule, "background"),
    );

    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
