import { describe, expect, it } from "vitest";

import { metadata, viewport } from "./layout";

describe("root metadata", () => {
  it("declares the canonical app identity and search metadata", () => {
    expect(metadata.metadataBase?.toString()).toBe("https://birthdates-page.vercel.app/");
    expect(metadata).toMatchObject({
      title: "Student Birthdates",
      description: "Keep student birthdays close and celebrate every special day.",
      applicationName: "Student Birthdates",
      keywords: ["student birthdays", "birthday calendar", "printable birthday calendar", "English", "Dutch"],
      authors: [{ name: "Omar", url: "https://omarcode.dev/" }],
      creator: "Omar",
      publisher: "Omar",
      alternates: { canonical: "/" },
      robots: { index: true, follow: true },
    });
  });

  it("provides installation metadata without overriding file-based icons", () => {
    expect(metadata).toMatchObject({
      manifest: "/manifest.webmanifest",
      appleWebApp: { capable: true, title: "Birthdays", statusBarStyle: "default" },
      formatDetection: { telephone: false },
    });
    expect(metadata.icons).toBeUndefined();
  });

  it("provides complete website and social sharing metadata", () => {
    expect(metadata.openGraph).toEqual({
      type: "website",
      url: "/",
      siteName: "Student Birthdates",
      title: "Student Birthdates",
      description: "Keep student birthdays close and celebrate every special day.",
      locale: "en_US",
      alternateLocale: ["nl_BE"],
      images: [{
        url: "/branding/birthday-calendar-logo.png",
        width: 1254,
        height: 1254,
        alt: "Golden Birthday Calendar logo",
      }],
    });
    expect(metadata.twitter).toEqual({
      card: "summary_large_image",
      title: "Student Birthdates",
      description: "Keep student birthdays close and celebrate every special day.",
      images: [{
        url: "/branding/birthday-calendar-logo.png",
        alt: "Golden Birthday Calendar logo",
      }],
    });
  });

  it("sets a responsive viewport and navy browser theme", () => {
    expect(viewport).toMatchObject({
      width: "device-width",
      initialScale: 1,
      themeColor: "#172a46",
    });
  });
});
