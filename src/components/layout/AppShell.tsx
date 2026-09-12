import type { ReactNode } from "react";
import Link from "next/link";
import { AppSidebar } from "./AppSidebar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  title: string;
  children: ReactNode;
};

// The shared authenticated-app shell: fixed sidebar on desktop, bottom nav on
// mobile. Every signed-in page (except onboarding) wraps its content in this.
// The page's own <h1> is the only visible title — `title` feeds the browser tab.
export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <title>{`${title} — 20fourr`}</title>
      <AppSidebar />

      <header className={styles.header}>
        <Link href="/dashboard" className={styles.headerWordmark}>
          20fourr
        </Link>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
