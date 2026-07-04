import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Redlix Training Academy",
    template: "%s | Redlix Training Academy",
  },
  description:
    "Redlix Training Academy — Elevate your technical expertise with curated engineering resources, video lectures, and hands-on database training.",
  keywords: [
    "Redlix",
    "Training Academy",
    "Engineering",
    "Full Stack",
    "Database",
    "Learning",
    "Lectures",
    "Resources",
  ],
  authors: [{ name: "Redlix Pro Wing" }],
  creator: "Redlix Pro Wing",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "Redlix Training Academy",
    description:
      "Elevate your technical expertise with curated engineering resources, video lectures, and hands-on database training.",
    siteName: "Redlix Training Academy",
    images: [
      {
        url: "https://ik.imagekit.io/dypkhqxip/logotraining",
        width: 400,
        height: 100,
        alt: "Redlix Training Academy",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Redlix Training Academy",
    description:
      "Elevate your technical expertise with curated engineering resources and video lectures.",
    images: ["https://ik.imagekit.io/dypkhqxip/logotraining"],
  },
  icons: {
    icon: [
      { url: "https://ik.imagekit.io/dypkhqxip/faviconn", type: "image/png" },
    ],
    apple: [
      { url: "https://ik.imagekit.io/dypkhqxip/faviconn", type: "image/png" },
    ],
    shortcut: "https://ik.imagekit.io/dypkhqxip/faviconn",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href="https://ik.imagekit.io/dypkhqxip/faviconn" type="image/png" />
        <link rel="apple-touch-icon" href="https://ik.imagekit.io/dypkhqxip/faviconn" />
        <link rel="shortcut icon" href="https://ik.imagekit.io/dypkhqxip/faviconn" />

        {/* Material Symbols Outlined — full icon set */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />

        {/* Theme colour for browser chrome */}
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="msapplication-TileColor" content="#1d4ed8" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
