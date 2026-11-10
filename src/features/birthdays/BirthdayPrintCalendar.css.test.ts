import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(
  resolve(process.cwd(), "src/features/birthdays/BirthdayPrintCalendar.module.css"),
  "utf8",
);
const printStyles = styles.split("@media print")[1];

function printRule(selector: string) {
  const rule = printStyles.match(new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`))?.[1];
  expect(rule, `print rule .${selector}`).toBeDefined();
  return rule!;
}

describe("birthday print layout contract", () => {
  it("keeps dense months in two grid columns instead of fragmented CSS columns", () => {
    const dense = printRule("dense");

    expect(dense).toMatch(/display:\s*grid\s*;/);
    expect(dense).toMatch(/grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;/);
    expect(dense).not.toMatch(/column-count\s*:/);
    expect(printRule("birthday")).toMatch(/break-inside:\s*avoid\s*;/);
  });

  it("fits the available page width while preserving the portrait A4 ratio", () => {
    const sheet = printRule("sheet");

    expect(sheet).toMatch(/(?:^|;)\s*width:\s*100%\s*;/);
    expect(sheet).toMatch(/max-width:\s*210mm\s*;/);
    expect(sheet).toMatch(/(?:^|;)\s*height:\s*auto\s*;/);
    expect(sheet).toMatch(/aspect-ratio:\s*210\s*\/\s*297\s*;/);
    expect(sheet).toMatch(/margin:\s*0\s+auto\s*;/);
    expect(sheet).toMatch(/box-sizing:\s*border-box\s*;/);
    expect(sheet).not.toMatch(/(?:^|;)\s*(?:width:\s*210mm|height:\s*297mm)\s*;/);
  });

  it("reserves room for seven-entry months when browser margins reduce the sheet", () => {
    expect(printRule("sheet")).toMatch(/(?:^|;)\s*gap:\s*4mm\s*;/);
    expect(printRule("monthGrid")).toMatch(/(?:^|;)\s*gap:\s*3mm\s*;/);
  });

  it("keeps the final row inside seven-entry cards with 7mm page margins", () => {
    expect(printRule("birthday")).toMatch(/(?:^|;)\s*padding:\s*0\.2mm\s+0\s*;/);
  });
});
