"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { PHOTOS, type Photo } from "./photos";
import styles from "./Doors.module.css";

type Door = "agency" | "individual";

// The chosen door lives in the URL hash, so a shared link opens the right half of the page.
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readDoor = (): Door => (window.location.hash === "#individual" ? "individual" : "agency");
const serverDoor = (): Door => "agency";

/** A door's photograph with what it shows set on top of it. */
function DoorPhoto({ photo, priority }: { photo: Photo; priority?: boolean }) {
  return (
    <figure className={styles.photo}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes="(max-width: 860px) 100vw, 640px"
        style={{ objectFit: "cover", objectPosition: photo.position }}
      />
      <figcaption className={styles.photoCaption}>{photo.caption}</figcaption>
    </figure>
  );
}

export function Doors({ agency, individual }: { agency: ReactNode; individual: ReactNode }) {
  const door = useSyncExternalStore(subscribe, readDoor, serverDoor);
  const bodyRef = useRef<HTMLDivElement>(null);

  // The nav links set the hash directly; bring the chosen half of the page into view with them.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash !== "#agency" && window.location.hash !== "#individual") return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      bodyRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function choose(next: Door) {
    const apply = () => {
      window.history.replaceState(null, "", `#${next}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (next !== door && "startViewTransition" in document && !reduce) {
      document.startViewTransition(() => flushSync(apply));
    } else {
      apply();
    }
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.inner}>
          <h1 id="hero-title" className={styles.title}>
            Clients book verified security on 20fourr.
            <span className={styles.titleSub}> Join with your agency, or on your own.</span>
          </h1>

          <div className={styles.doors}>
            <article
              className={`${styles.door} ${styles.doorAgency} ${door === "agency" ? styles.doorChosen : ""}`}
              aria-labelledby="door-agency"
            >
              <DoorPhoto photo={PHOTOS.siteTeam} priority />
              <h2 id="door-agency" className={styles.doorTitle}>
                I run a security agency
              </h2>
              <ul className={styles.facts}>
                <li>A rate card for every city you work in, with monthly and yearly packages.</li>
                <li>Clients book your team as one booking: six bouncers, one payment.</li>
                <li>Your roster, their documents and who is on which job, in one place.</li>
              </ul>

              <div className={styles.actions}>
                <Link href="/register" className={styles.primary}>
                  Register your agency
                </Link>
                <button
                  type="button"
                  className={styles.how}
                  aria-pressed={door === "agency"}
                  aria-label="How it works for agencies"
                  onClick={() => choose("agency")}
                >
                  How it works
                </button>
              </div>
            </article>

            <article
              className={`${styles.door} ${door === "individual" ? styles.doorChosen : ""}`}
              aria-labelledby="door-individual"
            >
              <DoorPhoto photo={PHOTOS.uniform} priority />
              <h2 id="door-individual" className={styles.doorTitle}>
                I work on my own
              </h2>
              <ul className={styles.facts}>
                <li>Your daily rate, your city, your shift length.</li>
                <li>Switch on when you&apos;re free; block the days you&apos;re not.</li>
                <li>Paid per booking, to your own bank account.</li>
              </ul>

              <div className={styles.actions}>
                <Link href="/register" className={styles.secondary}>
                  Register on your own
                </Link>
                <button
                  type="button"
                  className={styles.how}
                  aria-pressed={door === "individual"}
                  aria-label="How it works on your own"
                  onClick={() => choose("individual")}
                >
                  How it works
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div ref={bodyRef} id="how-it-works" className={styles.body}>
        {door === "agency" ? agency : individual}
      </div>
    </>
  );
}
