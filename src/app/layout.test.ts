import { describe, expect, it } from "vitest";

import { metadata } from "./layout";

describe("root metadata", () => {
  it("declares the birthday calendar logo as the site icon", () => {
    expect(metadata.icons).toMatchObject({
      icon: "/branding/birthday-calendar-logo.png",
    });
  });
});
