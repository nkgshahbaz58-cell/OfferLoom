import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ChurnSentinel - Customer Churn Early Warning System",
  description:
    "AI-powered churn prediction for SaaS. Monitor customer health, get real-time alerts, and retain more revenue with ChurnSentinel.",
  keywords: [
    "churn prediction",
    "customer retention",
    "SaaS analytics",
    "Stripe integration",
    "revenue protection",
  ],
  authors: [{ name: "ChurnSentinel" }],
  openGraph: {
    title: "ChurnSentinel - Stop Churn Before It Costs You",
    description:
      "AI-powered early warning system that identifies at-risk customers and helps you retain more revenue.",
    type: "website",
    siteName: "ChurnSentinel",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChurnSentinel - Customer Churn Early Warning",
    description: "Monitor customer health and prevent churn with real-time risk scoring.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
