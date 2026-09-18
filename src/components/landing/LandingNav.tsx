"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import styles from "./LandingNav.module.css";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#earnings", label: "Earnings" },
  { href: "#verification", label: "Verification" },
  { href: "#payments", label: "Payments" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      
      if (event.key === "Tab") {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        
        // We include the menu button itself since it acts as the close button
        const focusableElements = [
          document.querySelector(`[aria-controls="${panelId}"]`),
          ...Array.from(panel.querySelectorAll('a[href], button:not([disabled])'))
        ].filter(Boolean) as HTMLElement[];
        
        if (focusableElements.length === 0) return;
        
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            event.preventDefault();
          }
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, panelId]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.wordmark}>
          20fourr<span className={styles.wordmarkDot} />
        </Link>

        <ul className={styles.links}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link href="/login" className={styles.signIn}>
            Sign in
          </Link>
          <Link href="/register" className={styles.cta}>
            Start earning
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
            <span className={styles.menuLabel}>{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      {open ? (
        <div id={panelId} className={styles.panel} role="dialog" aria-modal="true" aria-label="Menu">
          <ul className={styles.panelLinks}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.panelLink} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.panelActions}>
            <Link href="/login" className={styles.panelSignIn} onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link href="/register" className={styles.panelCta} onClick={() => setOpen(false)}>
              Start earning
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
