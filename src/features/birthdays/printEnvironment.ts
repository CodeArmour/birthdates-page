export type PrintEnvironmentInput = Readonly<{
  displayModeStandalone: boolean;
  navigatorStandalone?: boolean;
  userAgent: string;
}>;

export function detectPrintEnvironment(
  input: PrintEnvironmentInput,
): "default" | "ios-browser" | "ios-standalone" {
  if (!/iPhone|iPad|iPod/.test(input.userAgent)) {
    return "default";
  }

  return input.displayModeStandalone || input.navigatorStandalone
    ? "ios-standalone"
    : "ios-browser";
}
