import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import BirthdayPrintCalendar from "./BirthdayPrintCalendar";
import { BUILT_IN_BIRTHDAYS } from "./builtInBirthdays";

afterEach(cleanup);

describe("birthday print calendar", () => {
  it("keeps the duplicate calendar outside the screen accessibility tree", () => {
    const { container } = render(
      <BirthdayPrintCalendar students={BUILT_IN_BIRTHDAYS} language="en" />,
    );

    expect(container.firstElementChild).toHaveAttribute("data-print-calendar");
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(within(container).queryByRole("heading")).not.toBeInTheDocument();
    expect(container.querySelector("a, button, input, [tabindex]")).toBeNull();
  });

  it("prints every birthday under the twelve English month headings without a year", () => {
    const { container } = render(
      <BirthdayPrintCalendar students={BUILT_IN_BIRTHDAYS} language="en" />,
    );

    expect(Array.from(container.querySelectorAll("h2"), (heading) => heading.textContent)).toEqual([
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]);
    expect(container.querySelectorAll("li")).toHaveLength(62);
    expect(container.textContent).not.toContain("2000");
    expect(Array.from(container.querySelectorAll("li"), (item) => item.textContent)).toContain("29 Ali.H");
    expect(Array.from(container.querySelectorAll("li"), (item) => item.textContent)).toContain("13 Sally");
  });

  it("prints the complete January day/name sequence exactly once in day and source order", () => {
    const { container } = render(
      <BirthdayPrintCalendar students={BUILT_IN_BIRTHDAYS} language="en" />,
    );
    const january = Array.from(container.querySelectorAll("section"))
      .find((month) => month.querySelector("h2")?.textContent === "January");

    expect(january).toBeDefined();
    expect(Array.from(january!.querySelectorAll("li"), (item) => item.textContent)).toEqual([
      "03 Trinity", "05 Graham", "07 Ginny", "07 Nothando", "12 Perle",
      "16 Nabila", "18 Bill", "19 Eva", "20 Annisa", "21 Guerin", "30 Sara",
    ]);
  });

  it("preserves same-day source order, including Erdem before Anna on March 5", () => {
    const { container } = render(
      <BirthdayPrintCalendar students={BUILT_IN_BIRTHDAYS} language="en" />,
    );
    const march = Array.from(container.querySelectorAll("section"))
      .find((month) => month.querySelector("h2")?.textContent === "March");

    expect(march).toBeDefined();
    expect(Array.from(march!.querySelectorAll("li"), (item) => item.textContent)).toEqual([
      "05 Erdem", "05 Anna", "11 Duru", "11 Lee", "16 Victory", "17 River", "21 Defne",
    ]);
  });

  it("uses the current Dutch language for the print title, months, QR, and footer", () => {
    const { container } = render(
      <BirthdayPrintCalendar students={BUILT_IN_BIRTHDAYS} language="nl" />,
    );

    for (const text of [
      "Onze klas", "Verjaardagenkalender", "Eén klas, het hele jaar lang", "Januari", "Maart",
      "Scan voor onze website", "Gelukkige mensen, helderdere morgen", "Met liefde ontwikkeld door Omar",
    ]) {
      expect(within(container).getByText(text)).toBeInTheDocument();
    }
    expect(container.querySelectorAll("li")).toHaveLength(62);
    expect(container.textContent).not.toContain("2000");
  });

  it("uses the supplied QR and the three exact local brand assets", () => {
    const { container } = render(
      <BirthdayPrintCalendar students={BUILT_IN_BIRTHDAYS} language="en" />,
    );

    expect(Array.from(container.querySelectorAll("img"), (image) => image.getAttribute("src"))).toEqual([
      "/branding/birthday-calendar-logo.png",
      "/branding/birthday-calendar-qr.png",
      "/branding/university-of-antwerp-logo.png",
      "/branding/linguapolis-logo.jpg",
    ]);
    expect(within(container).getByText("Scan to open our website")).toBeInTheDocument();
    expect(within(container).getByText("Happier people, brighter tomorrows")).toBeInTheDocument();
    expect(within(container).getByText("Developed with love by Omar")).toBeInTheDocument();
  });
});
