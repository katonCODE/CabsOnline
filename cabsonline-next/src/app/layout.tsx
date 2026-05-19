import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
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
  title: "CabsOnline",
  description: "Online cab booking and admin dashboard",
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
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-950">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-xl font-bold text-zinc-950" href="/">
              CabsOnline
            </Link>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-zinc-700">
              <Link className="hover:text-yellow-700" href="/booking">
                Booking
              </Link>
              <Link className="hover:text-yellow-700" href="/admin/bookings">
                Admin bookings
              </Link>
              <Link className="hover:text-yellow-700" href="/admin/map">
                Admin map
              </Link>
              <Link className="hover:text-yellow-700" href="/login">
                Login
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
