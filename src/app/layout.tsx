import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal Planner",
  description: "AI-powered weekly meal planner",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="bg-gray-50 min-h-screen">{children}<Analytics /></body>
    </html>
  );
}
