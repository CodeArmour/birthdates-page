import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://birthdates-page.vercel.app"),
  title: "Student Birthdates",
  description: "Keep student birthdays close and celebrate every special day.",
  applicationName: "Student Birthdates",
  keywords: ["student birthdays", "birthday calendar", "printable birthday calendar", "English", "Dutch"],
  authors: [{ name: "Omar", url: "https://omarcode.dev/" }],
  creator: "Omar",
  publisher: "Omar",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Birthdays", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Birthdates",
    description: "Keep student birthdays close and celebrate every special day.",
    images: [{
      url: "/branding/birthday-calendar-logo.png",
      alt: "Golden Birthday Calendar logo",
    }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#172a46",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
