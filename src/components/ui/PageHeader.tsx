import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  intro?: string;
  /** A single control that belongs to the page as a whole, e.g. "New ticket". */
  action?: ReactNode;
};

// Every signed-in page opened with its own copy of the same h1 + intro rules.
// This is that pattern, declared once — AppShell owns the padding, this owns
// the page's title block.
export function PageHeader({ title, intro, action }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  );
}
