import type { Metadata } from "next";
import { Roboto_Slab, Public_Sans } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const displayFont = Roboto_Slab({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "20fourr for providers",
  description: "Manage bookings, duty shifts, and payouts as a verified security professional.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
