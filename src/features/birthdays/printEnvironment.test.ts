import { describe, expect, it } from "vitest";

import { detectPrintEnvironment } from "./printEnvironment";

describe("print environment detection", () => {
  it.each(["iPhone", "iPad", "iPod"])("identifies %s browsers", (device) => {
    expect(detectPrintEnvironment({
      userAgent: `Mozilla/5.0 (${device}; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15`,
      displayModeStandalone: false,
    })).toBe("ios-browser");
  });

  it.each([
    { navigatorStandalone: true, displayModeStandalone: false },
    { navigatorStandalone: false, displayModeStandalone: true },
  ])("recognizes either standalone signal: %o", (signals) => {
    expect(detectPrintEnvironment({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      ...signals,
    })).toBe("ios-standalone");
  });

  it.each([
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0",
  ])("keeps other platforms on the default path even in standalone: %s", (userAgent) => {
    expect(detectPrintEnvironment({
      userAgent,
      displayModeStandalone: true,
      navigatorStandalone: true,
    })).toBe("default");
  });
});
