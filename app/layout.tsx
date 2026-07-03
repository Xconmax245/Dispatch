import type { Metadata } from "next";
import "./globals.css";
import { AOSInit } from "@/components/AOSInit";

export const metadata: Metadata = {
  title: "Dispatch",
  description: "Cost-aware AI routing via BTL Runtime — intelligence, allocated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400&f[]=comico@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-mono">
        <AOSInit />
        {children}
      </body>
    </html>
  );
}
