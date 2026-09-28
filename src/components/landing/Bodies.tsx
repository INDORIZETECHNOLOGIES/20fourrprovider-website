import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./Bodies.module.css";

type LiveCity = { key: string; name: string };

// Rupees with paise where there are any, Indian digit grouping. These are worked examples, so the
// arithmetic is written out here where it can be checked against the tax rules it illustrates.
const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

function Section({
  id,
  title,
  children,
  aside,
  tone = "paper",
}: {
  id: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
  tone?: "paper" | "raised" | "navy";
}) {
  return (
    <section id={id} className={`${styles.section} ${styles[tone]}`} aria-labelledby={`${id}-title`}>
      <div className={`${styles.inner} ${aside ? styles.split : ""}`}>
        <div className={styles.text}>
          <h2 id={`${id}-title`} className={styles.title}>
            {title}
          </h2>
          {children}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}

function CitiesLine({ cities }: { cities: LiveCity[] }) {
  if (cities.length === 0) return null;
  const names = cities.map((c) => c.name);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <p className={styles.live}>
      <span className={styles.liveDot} aria-hidden="true" />
      Clients can book providers in {list} today. A city you price joins the list.
    </p>
  );
}

/** A worked settlement, line by line. Every figure is computed from the lines above it. */
function Statement({
  title,
  lines,
  total,
  note,
}: {
  title: string;
  lines: Array<{ label: string; detail?: string; amount: number; sign?: "+" | "−" }>;
  total: number;
  note: string;
}) {
  return (
    <figure className={`${styles.doc} ${styles.statement}`}>
      <p className={styles.docTitle}>Settlement statement</p>
      <p className={styles.docSubject}>{title}</p>
      <table className={styles.statementTable}>
        <tbody>
          {lines.map((l) => (
            <tr key={l.label}>
              <th scope="row">
                {l.label}
                {l.detail ? <span>{l.detail}</span> : null}
              </th>
              <td>
                {l.sign === "−" ? "− " : l.sign === "+" ? "+ " : ""}
                {inr(l.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">To your bank</th>
            <td>{inr(total)}</td>
          </tr>
        </tfoot>
      </table>
      <figcaption className={styles.caption}>{note}</figcaption>
    </figure>
  );
}

function Checklist({ items, optional }: { items: string[]; optional?: string }) {
  return (
    <div className={styles.checklist}>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
      {optional ? <p className={styles.caption}>{optional}</p> : null}
    </div>
  );
}

const SIGNALS = [
  ["Turning up", "Shifts missed without notice count most."],
  ["Finishing jobs", "Jobs completed out of those accepted."],
  ["Keeping bookings", "Cancelling after you accept lowers you."],
  ["Responding", "How quickly you accept or decline a new request."],
  ["Client ratings", "Stars, weighed by how many you have."],
  ["Complaints", "Disputes and serious incidents raised by clients."],
];

function Ranking() {
  return (
    <Section
      id="ranking"
      tone="raised"
      title="What moves you up in search"
      aside={
        <figure className={styles.doc}>
          <p className={styles.docTitle}>Ranking signals</p>
          <p className={styles.docSubject}>Six, recent work weighted most</p>
          <table className={styles.docTable}>
            <tbody>
              {SIGNALS.map(([name, detail]) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  <td>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      }
    >
      <p className={styles.lede}>
        Clients see providers in order of how reliably they deliver. Ratings are one signal of six, and recent work
        counts more than old work.
      </p>
      <p>You can see where you stand on each signal in the app, with what to do about any that need attention.</p>
    </Section>
  );
}

// ── For agencies ────────────────────────────────────────────────────────────────────────────────

const AGENCY_BASE = 6 * 3 * 2000; // 6 bouncers × 3 days × ₹2,000
const AGENCY_GST = AGENCY_BASE * 0.18;
const AGENCY_TCS = AGENCY_BASE * 0.005; // §52: 0.5% of the price before GST
const AGENCY_TDS = Math.round((AGENCY_BASE + AGENCY_GST) * 0.001 * 100) / 100; // §194-O: 0.1% of the price with GST
const AGENCY_NET = AGENCY_BASE + AGENCY_GST - AGENCY_TCS - AGENCY_TDS;

export function AgencyBody({ cities }: { cities: LiveCity[] }) {
  return (
    <>
      <Section
        id="agency-rates"
        title="Price each city you work in"
        aside={
          <figure className={`${styles.doc} ${styles.rateCard}`}>
            <p className={styles.docTitle}>Rate card</p>
            <p className={styles.docSubject}>Mumbai</p>
            <table>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Per day</th>
                  <th scope="col">Per month</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    Security guard<span>12-hour shift</span>
                  </th>
                  <td>₹1,500</td>
                  <td>₹36,000</td>
                </tr>
                <tr>
                  <th scope="row">
                    Bouncer<span>8-hour shift</span>
                  </th>
                  <td>₹2,000</td>
                  <td className={styles.none}>Daily only</td>
                </tr>
                <tr>
                  <th scope="row">
                    Armed guard<span>12-hour shift</span>
                  </th>
                  <td>₹3,500</td>
                  <td>₹84,000</td>
                </tr>
              </tbody>
            </table>
            <figcaption className={styles.caption}>Example rates. You set your own, city by city.</figcaption>
          </figure>
        }
      >
        <p className={styles.lede}>
          Rates in Mumbai aren&apos;t rates in Nagpur. Keep a separate rate card for each city, with a daily rate per
          service and, if you want the longer work, a monthly or yearly package.
        </p>
        <p>
          Clients only find you in cities you&apos;ve priced, and every booking is priced from the city the guards
          work in. A package applies to bookings of a month or more; shorter ones use the daily rate.
        </p>
        <CitiesLine cities={cities} />
      </Section>

      <Section
        id="agency-team"
        tone="raised"
        title="Send the whole team"
        aside={
          <figure className={`${styles.doc} ${styles.roster}`}>
            <p className={styles.docTitle}>Team</p>
            <p className={styles.docSubject}>6 × Bouncer · assign 6</p>
            <ul>
              {[
                ["RP", "Ravi Patil", "6 years · Marathi, Hindi", "Ready"],
                ["IS", "Imran Shaikh", "8 years · Hindi, Urdu", "Ready"],
                ["VR", "Vikram Rathore", "11 years · Hindi, English", "Ready"],
                ["DC", "Deepak Chauhan", "Police verification expired", "Blocked"],
              ].map(([initials, name, meta, state]) => (
                <li key={name} className={state === "Blocked" ? styles.blocked : ""}>
                  <span className={styles.initials} aria-hidden="true">
                    {initials}
                  </span>
                  <span className={styles.person}>
                    {name}
                    <span>{meta}</span>
                  </span>
                  <span className={styles.state}>{state === "Blocked" ? "Can't be sent" : "Ready"}</span>
                </li>
              ))}
            </ul>
            <figcaption className={styles.caption}>Example roster. Names are illustrative.</figcaption>
          </figure>
        }
      >
        <p className={styles.lede}>
          A client asks for six bouncers for three nights. That&apos;s one booking and one payment, and your team does
          the work.
        </p>
        <p>
          Tell us how many of each you can field on each date, and multi-person bookings only reach you for dates you can staff. After you
          accept, pick the six from your roster. We check each person&apos;s documents are valid through the last day.
        </p>
        <p>
          The client sees each person&apos;s photo, first initial, experience and languages before paying, and their
          name and phone number once they&apos;ve paid. Someone falls ill? Swap them before duty starts.
        </p>
      </Section>

      <Section
        id="agency-payouts"
        tone="navy"
        title="Paid per booking, with the tax worked out"
        aside={
          <Statement
            title={`6 × Bouncer · 3 days · ${inr(2000)} a day`}
            lines={[
              { label: "Your price", detail: "6 people × 3 days × ₹2,000", amount: AGENCY_BASE },
              { label: "GST on your service", detail: "18%, collected for you to file", amount: AGENCY_GST, sign: "+" },
              { label: "TCS", detail: "0.5% of your price, under §52", amount: AGENCY_TCS, sign: "−" },
              { label: "TDS", detail: "0.1% of price with GST, under §194-O", amount: AGENCY_TDS, sign: "−" },
            ]}
            total={AGENCY_NET}
            note="Worked example for a GST-registered agency. TCS and TDS are credited against your PAN."
          />
        }
      >
        <p className={styles.lede}>
          You&apos;re paid your full price. Our platform fee is charged to the client on top of it, never taken out of
          yours.
        </p>
        <p>
          The payout for a booking is released once duty ends and you&apos;ve uploaded your invoice for it, straight to
          your bank account through Razorpay. Razorpay checks your payout account once, before you can accept your
          first booking.
        </p>
        <p>Registered for GST? You issue a tax invoice. Not registered? A bill of supply. Both work.</p>
      </Section>

      <Section
        id="agency-verification"
        title="Verified once, for every state you cover"
        aside={
          <Checklist
            items={[
              "PSARA licence for each state you work in",
              "Company PAN and GST registration",
              "Incorporation, partnership or proprietorship proof",
              "Authorised signatory ID and office address proof",
              "Bank account proof",
              "Police verification and past-employment check",
              "PSARA compliance self-declaration",
            ]}
            optional="Arms licence, EPF, ESIC and insurance are added where they apply."
          />
        }
      >
        <p className={styles.lede}>
          Clients book you because we&apos;ve checked you. Upload your documents once and our team reviews them.
        </p>
        <p>
          While we review, set up your rate cards, team and bank account. Bookings open the day you&apos;re verified.
          Each person on your team carries their own PSARA training certificate and police verification, and an arms
          licence for armed roles.
        </p>
      </Section>

      <Ranking />
    </>
  );
}

// ── On your own ─────────────────────────────────────────────────────────────────────────────────

const SOLO_BASE = 1500;
const SOLO_TCS = SOLO_BASE * 0.005;
const SOLO_NET = SOLO_BASE - SOLO_TCS;

export function IndividualBody({ cities }: { cities: LiveCity[] }) {
  return (
    <>
      <Section
        id="solo-rates"
        title="Your rate, your city, your shift"
        aside={
          <figure className={`${styles.doc} ${styles.rateCard}`}>
            <p className={styles.docTitle}>Your rate card</p>
            <p className={styles.docSubject}>Mumbai</p>
            <table>
              <tbody>
                <tr>
                  <th scope="row">Daily rate</th>
                  <td>₹1,500</td>
                </tr>
                <tr>
                  <th scope="row">Shift length</th>
                  <td>12 hours</td>
                </tr>
                <tr>
                  <th scope="row">
                    Short bookings<span>optional</span>
                  </th>
                  <td>₹150 an hour, 4 hours minimum</td>
                </tr>
                <tr>
                  <th scope="row">
                    Monthly package<span>optional</span>
                  </th>
                  <td>₹36,000</td>
                </tr>
              </tbody>
            </table>
            <figcaption className={styles.caption}>Example rates. Any daily rate from ₹100 to ₹1,00,000.</figcaption>
          </figure>
        }
      >
        <p className={styles.lede}>
          Set a daily rate for each service you offer: security guard, bouncer, armed guard or personal security
          officer, and how many hours a shift is.
        </p>
        <p>
          Add hourly pricing if you take short jobs, and a monthly package if you want longer ones. Clients only find
          you in cities you&apos;ve priced.
        </p>
        <CitiesLine cities={cities} />
      </Section>

      <Section id="solo-days" tone="raised" title="Work the days you choose">
        <p className={styles.lede}>
          One switch marks you available or not. Block the days you can&apos;t work, and no booking lands on them.
        </p>
        <p>
          Requests arrive in the app and wait for you to accept or decline. Nothing is booked on your behalf. On the
          day, the shift starts and ends with a six-digit code the client gives you, so both sides agree it happened.
          SOS and check-ins are in the app for as long as the shift runs.
        </p>
      </Section>

      <Section
        id="solo-payouts"
        tone="navy"
        title="Paid per booking, to your own bank"
        aside={
          <Statement
            title={`1 × Security guard · 1 day · ${inr(SOLO_BASE)}`}
            lines={[
              { label: "Your price", amount: SOLO_BASE },
              { label: "TCS", detail: "0.5% of your price, under §52", amount: SOLO_TCS, sign: "−" },
              { label: "TDS", detail: "None below ₹5 lakh a year with a verified PAN", amount: 0, sign: "−" },
            ]}
            total={SOLO_NET}
            note="Worked example for an individual not registered for GST. TCS is credited against your PAN."
          />
        }
      >
        <p className={styles.lede}>
          You&apos;re paid your full price. Our platform fee is charged to the client on top, never taken out of yours.
        </p>
        <p>
          The payout is released once the shift ends and you&apos;ve uploaded your invoice for it, straight to your bank
          account through Razorpay. Your payout account is checked by Razorpay once before your first booking. Most
          individuals don&apos;t need GST registration below ₹20 lakh a year.
        </p>
      </Section>

      <Section
        id="solo-verification"
        title="Verified once"
        aside={
          <Checklist
            items={[
              "Aadhaar and PAN",
              "A live selfie",
              "Bank account proof",
              "Police verification",
              "Past-employment check",
              "PSARA compliance self-declaration",
            ]}
            optional="Armed roles also need your arms licence. Training, first-aid and ex-serviceman papers are optional and show on your profile."
          />
        }
      >
        <p className={styles.lede}>Upload your documents once and our team reviews them.</p>
        <p>
          While we review, set your rates and add your bank account. Bookings open the day you&apos;re verified. Run an
          agency instead? <Link href="#agency">See how it works for agencies.</Link>
        </p>
      </Section>

      <Ranking />
    </>
  );
}
