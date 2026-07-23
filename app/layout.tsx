import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NotificationListener from "../components/NotificationListener";
import ReduxProvider from "../lib/redux/Provider";
import AppTheme from "./AppTheme";
import "./globals.css";

import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moor",
  description: "Sell Anything Anywhere",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <ReduxProvider>
          <AppTheme>
            <NextTopLoader color="red" />
            <NotificationListener />

            <div className="">{children}</div>
          </AppTheme>
        </ReduxProvider>
      </body>
    </html>
  );
}
