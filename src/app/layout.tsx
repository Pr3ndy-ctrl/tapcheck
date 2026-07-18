import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TapCheck",
  description: "Plain-language drinking water quality reports by ZIP code.",
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
      <head><script dangerouslySetInnerHTML={{ __html: "try { const theme = localStorage.getItem('tapcheck-theme'); const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.add(dark ? 'dark' : 'light'); } catch {}" }} /></head>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
