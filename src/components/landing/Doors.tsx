"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import styles from "./Doors.module.css";

type Door = "agency" | "individual";

/**
 * Real photographs go here when they're supplied — each `{ src, alt }` under /public/landing.
 * Until then the doors carry a drawn artefact from the product instead of a stock image.
 */
const PHOTOS: Record<Door, { src: string; alt: string } | null> = {
  agency: null,
  individual: null,
};

// The chosen door lives in the URL hash, so a shared link opens the right half of the page.
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readDoor = (): Door => (window.location.hash === "#individual" ? "individual" : "agency");
const serverDoor = (): Door => "agency";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK: Array<{ service: string; days: Array<[booked: number, declared: number]> }> = [
  { service: "Security guards", days: [[14, 20], [16, 20], [20, 20], [12, 20], [18, 20], [8, 12], [0, 0]] },
  { service: "Bouncers", days: [[6, 10], [10, 10], [8, 10], [4, 8], [8, 12], [12, 12], [0, 0]] },
];

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
              {PHOTOS.agency ? (
                // eslint-disable-next-line @next/next/no-img-element -- owner-supplied photo, sized by CSS
                <img className={styles.photo} src={PHOTOS.agency.src} alt={PHOTOS.agency.alt} />
              ) : null}
              <h2 id="door-agency" className={styles.doorTitle}>
                I run a security agency
              </h2>
              <ul className={styles.facts}>
                <li>A rate card for every city you work in, with monthly and yearly packages.</li>
                <li>Clients book your team as one booking: six bouncers, one payment.</li>
                <li>Your roster, their documents and who is on which job, in one place.</li>
              </ul>

              <figure className={styles.week} aria-label="Example: a week of bookings against the headcount declared, for two services">
                <div className={styles.weekDays} aria-hidden="true">
                  <span />
                  {DAYS.map((d) => (
                    <span key={d} className={styles.weekName}>
                      {d}
                    </span>
                  ))}
                </div>
                {WEEK.map((row) => (
                  <div key={row.service} className={styles.weekRow} aria-hidden="true">
                    <span className={styles.weekService}>{row.service}</span>
                    {row.days.map(([booked, declared], i) => (
                      <span key={DAYS[i]} className={`${styles.weekDay} ${declared === 0 ? styles.weekOff : ""}`}>
                        <span className={styles.weekFigure}>
                          {declared === 0 ? (
                            "Off"
                          ) : (
                            <>
                              <b>{booked}</b>/{declared}
                            </>
                          )}
                        </span>
                        <span className={styles.weekMeter}>
                          <span
                            className={`${styles.weekFill} ${declared > 0 && booked >= declared ? styles.weekFull : ""}`}
                            style={{ transform: `scaleX(${declared ? booked / declared : 0})` }}
                          />
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
                <figcaption className={styles.caption}>Booked out of those you can field, by day. Example week.</figcaption>
              </figure>

              <div className={styles.actions}>
                <Link href="/register" className={styles.primary}>
                  Register your agency
                </Link>
                <button type="button" className={styles.how} aria-pressed={door === "agency"} onClick={() => choose("agency")}>
                  How it works for agencies
                </button>
              </div>
            </article>

            <article
              className={`${styles.door} ${door === "individual" ? styles.doorChosen : ""}`}
              aria-labelledby="door-individual"
            >
              {PHOTOS.individual ? (
                // eslint-disable-next-line @next/next/no-img-element -- owner-supplied photo, sized by CSS
                <img className={styles.photo} src={PHOTOS.individual.src} alt={PHOTOS.individual.alt} />
              ) : null}
              <h2 id="door-individual" className={styles.doorTitle}>
                I work on my own
              </h2>
              <ul className={styles.facts}>
                <li>Your daily rate, your city, your shift length.</li>
                <li>Switch on when you&apos;re free; block the days you&apos;re not.</li>
                <li>Paid per booking, to your own bank account.</li>
              </ul>

              <figure className={styles.credential} aria-label="Example: how a verified individual appears to clients">
                <div className={styles.credentialRow} aria-hidden="true">
                  <span className={styles.credentialName}>Security guard · Mumbai</span>
                  <span className={styles.credentialMark}>Verified</span>
                </div>
                <div className={styles.credentialRow} aria-hidden="true">
                  <span className={styles.credentialRate}>
                    ₹1,500 <small>a day</small>
                  </span>
                  <span className={styles.credentialMeta}>12-hour shift</span>
                </div>
                <figcaption className={styles.caption}>How you appear in search. Example rate.</figcaption>
              </figure>

              <div className={styles.actions}>
                <Link href="/register" className={styles.secondary}>
                  Register on your own
                </Link>
                <button
                  type="button"
                  className={styles.how}
                  aria-pressed={door === "individual"}
                  onClick={() => choose("individual")}
                >
                  How it works on your own
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
