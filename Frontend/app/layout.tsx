import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Home Booking Platform",
  description: "Next.js frontend connected to a Laravel listings API.",
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
