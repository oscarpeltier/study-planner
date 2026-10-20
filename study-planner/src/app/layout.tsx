import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Cap sur tes études",
  description: "Organise tes tâches et avance sereinement dans tes études.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav aria-label="Navigation principale" className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-slate-900">
              Cap sur tes études
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                Accueil
              </Link>
              <Link href="/tasks" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                Tâches
              </Link>
              <Link href="/tasks/new" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                Nouvelle tâche
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
