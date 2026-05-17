import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasoi — Fine Indian Kitchen",
  description: "Scan. Order. Savour. Your premium dining companion.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Rasoi" },
  other: { "mobile-web-app-capable": "yes" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
