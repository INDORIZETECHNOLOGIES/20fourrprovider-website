import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { Doors } from "@/components/landing/Doors";
import { AgencyBody, IndividualBody } from "@/components/landing/Bodies";
import { Faq } from "@/components/landing/Faq";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "20fourr for security agencies and professionals",
  description:
    "Clients in India book verified, PSARA-compliant security on 20fourr. Join as an agency with your whole team, or on your own. Set your rates per city and get paid per booking.",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

export type LiveCity = { key: string; name: string };

/** Cities where clients can book today — real data, refreshed hourly. Empty on any failure. */
async function liveCities(): Promise<LiveCity[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/cities`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body?.data?.cities) ? body.data.cities : [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const cities = await liveCities();

  return (
    <div className={styles.page}>
      <LandingNav />

      <main id="main">
        <Doors agency={<AgencyBody cities={cities} />} individual={<IndividualBody cities={cities} />} />
        <Faq />

        <section className={styles.close} aria-labelledby="close-title">
          <div className={styles.closeInner}>
            <h2 id="close-title" className={styles.closeTitle}>
              Register now. Set everything up while we check your documents.
            </h2>
            <p className={styles.closeText}>
              Your rate cards, team and bank account can all be ready before the review ends. Bookings open the
              day you&apos;re verified.
            </p>
            <div className={styles.closeActions}>
              <Link href="/register" className={styles.primary}>
                Register your agency
              </Link>
              <Link href="/register" className={styles.secondary}>
                Register on your own
              </Link>
            </div>
            <p className={styles.closeSignIn}>
              Already registered? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerBrand}>
            20fourr<span className={styles.footerDot} aria-hidden="true" />
          </p>
          <nav className={styles.footerLinks} aria-label="Footer">
            <Link href="/login">Sign in</Link>
            <Link href="/register">Register</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:grievance@20fourr.com">grievance@20fourr.com</a>
          </nav>
        </div>
        <p className={styles.footerLegal}>
          © 2026 Indorize Technologies Pvt. Ltd. 20fourr connects clients with independent, verified security
          providers.
        </p>
      </footer>
    </div>
  );
}
