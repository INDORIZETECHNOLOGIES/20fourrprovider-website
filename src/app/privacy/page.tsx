import type { Metadata } from "next";
import styles from "../terms/page.module.css";

export const metadata: Metadata = { title: "Privacy Policy — 20fourr" };

export default function PrivacyPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Privacy Policy</h1>
      <p className={styles.body}>The full privacy policy is being finalized and will be published here.</p>
    </main>
  );
}
