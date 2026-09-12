import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  icon: IconName;
  title: string;
  body?: string;
  action?: { href: string; label: string };
};

// An empty list should tell the provider what fills it and what to do next,
// not just that it's empty.
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon}>
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className={styles.title}>{title}</p>
        {body ? <p className={styles.body}>{body}</p> : null}
        {action ? (
          <Link href={action.href} className={styles.action}>
            {action.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
