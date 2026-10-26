import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { isDemo } from "@/lib/mode";

export const metadata: Metadata = {
  title: "PaperTrail AI",
  description: "Mark your past-paper answers against the mark scheme, point by point.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Kalam:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        {isDemo() && (
          <div className="bg-ink px-4 py-2 text-center text-sm text-paper">
            Demo mode: marking uses step checks, not AI. Add an Anthropic API key to switch on AI marking.
          </div>
        )}
        <header className="border-b border-rule">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-baseline gap-1.5 text-lg font-bold">
              PaperTrail <span className="hand text-xl text-red" aria-hidden>✓</span>
            </Link>
            <div className="flex gap-5 text-[15px]">
              <Link href="/" className="hover:text-red">Questions</Link>
              <Link href="/practice/custom" className="hover:text-red">Your own question</Link>
              <Link href="/progress" className="hover:text-red">Progress</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-20">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-muted">
          AI marking can be wrong. Treat it as a second opinion and check anything surprising with your teacher.
          No names or logins are collected, and photos of your working are never stored.
        </footer>
      </body>
    </html>
  );
}
