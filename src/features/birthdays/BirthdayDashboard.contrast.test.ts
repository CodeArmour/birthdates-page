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

function colorToken(name: string) {
  const match = globalStyles.match(
    new RegExp(`${name}\\s*:\\s*(#[0-9a-f]{6})\\s*;`, "i"),
  );
  if (!match) {
    throw new Error(`Missing color token: ${name}`);
  }
  return match[1];
}

function eyebrowColor() {
  const rule = dashboardStyles.match(
    /\.eyebrow,\s*\.emptyLabel\s*\{([^}]*)\}/,
  )?.[1];
  const token = rule?.match(/color:\s*var\((--[^)]+)\)\s*;/)?.[1];
  if (!token) {
    throw new Error("Missing eyebrow color token");
  }
  return colorToken(token);
}

function rgb(hex: string) {
  return hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16));
}

function blend(foreground: string, background: string, opacity: number) {
  const foregroundChannels = rgb(foreground);
  const backgroundChannels = rgb(background);
  return `#${foregroundChannels
    .map((channel, index) =>
      Math.round(
        channel * opacity + backgroundChannels[index] * (1 - opacity),
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function relativeLuminance(hex: string) {
  const channels = rgb(hex)
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("dashboard eyebrow contrast", () => {
  it("keeps small eyebrow text at WCAG AA contrast on every dashboard surface", () => {
    const foreground = eyebrowColor();
    const paper = colorToken("--color-paper");
    const backgrounds = [
      colorToken("--color-cream"),
      "#fff4dc",
      paper,
      blend(colorToken("--color-coral"), paper, 0.18),
    ];

    for (const background of backgrounds) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
