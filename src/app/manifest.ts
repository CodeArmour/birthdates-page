import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Student Birthdates",
    short_name: "Birthdays",
    description: "Keep student birthdays close and celebrate every special day.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff8e9",
    theme_color: "#172a46",
    categories: ["education", "lifestyle"],
    icons: [
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
    ],
  };
}
