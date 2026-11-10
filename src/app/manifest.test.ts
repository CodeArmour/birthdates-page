import { describe, expect, it } from "vitest";

import manifest from "./manifest";

describe("web app manifest", () => {
  it("provides the birthday app identity and standalone launch settings", () => {
    expect(manifest()).toMatchObject({
      name: "Student Birthdates",
      short_name: "Birthdays",
      description: "Keep student birthdays close and celebrate every special day.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#fff8e9",
      theme_color: "#172a46",
      categories: ["education", "lifestyle"],
    });
  });

  it("provides sized PNG install icons including a maskable option", () => {
    expect(manifest().icons).toEqual([
      {
        src: "/icons/birthday-calendar-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/birthday-calendar-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ]);
  });
});
