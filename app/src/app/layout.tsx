import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trauma, Coping & Risk — 2023 National YRBS",
  description:
    "How sexual-violence victimization and household adversity relate to adolescent substance use and social withdrawal. A design-aware ML analysis of 20,103 US high school students.",
  openGraph: {
    title: "Trauma, Coping & Risk — 2023 National YRBS",
    description:
      "Risk-factor analysis of CSA-proxy exposure, substance use, and social withdrawal in a nationally representative adolescent sample.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
