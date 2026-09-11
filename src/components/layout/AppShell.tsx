import type { ReactNode } from "react";
import Link from "next/link";
import { AppSidebar } from "./AppSidebar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
};

// The shared authenticated-app shell: fixed sidebar on desktop, bottom nav on
// mobile, and a sticky header carrying the page title. Every page under the
// signed-in area should wrap its content in this instead of the old
// AppTopBar, so the sidebar (and its nav) is consistent everywhere.
export function AppShell({ title, headerAction, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <AppSidebar />

      <header className={styles.header}>
        <Link href="/dashboard" className={styles.headerWordmark}>
          20fourr
        </Link>
        <h1 className={styles.headerPageTitle}>{title}</h1>
        <div className={styles.headerRight}>{headerAction}</div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
