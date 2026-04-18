import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Laravel Connection",
  description: "Minimal frontend showing Laravel connection status.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-[family:var(--font-body)] antialiased">{children}</body>
    </html>
  );
}
