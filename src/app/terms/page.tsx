import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Terms of Service — 20fourr" };

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Terms of Service</h1>
      <p className={styles.body}>The full terms of service are being finalized and will be published here.</p>
    </main>
  );
}
