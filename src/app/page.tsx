import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { LandingNav } from "@/components/landing/LandingNav";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "20fourr for Providers — Get booked. Work. Get paid.",
  description:
    "Join 20fourr, get verified, choose relevant opportunities, set your rate and receive payments directly — for guards, bouncers, armed guards and PSOs.",
};

const VALUE_CARDS = [
  {
    icon: "receipt" as const,
    title: "Set your rate",
    body: "You choose which of the four categories you offer and set a daily rate for each, between ₹100 and ₹1,00,000, for shifts of 4–24 hours. You can change both later on Availability.",
  },
  {
    icon: "clipboard" as const,
    title: "Receive bookings",
    body: "Clients book you for a date, time and category. You see the request, accept or decline, then talk in-app once payment is in. There is no public job board to browse.",
  },
  {
    icon: "shield-check" as const,
    title: "Get verified",
    body: "Upload the documents required for your account type. Our team reviews them. Accepting work waits on verification; building your profile and adding a bank account does not.",
  },
  {
    icon: "building" as const,
    title: "Get paid",
    body: "After the shift is signed off, a settlement is calculated and paid to the bank account you confirmed. Payouts are not instant — they follow completed duty and settlement.",
  },
];

const JOURNEY = [
  {
    title: "Create your profile",
    body: "Register, then fill in who you are: individual or firm, city and state, categories, and years of experience.",
  },
  {
    title: "Complete verification",
    body: "Upload KYC and compliance documents. Firms also attach a PSARA licence. The team reviews what you send — verification is a document check, not a guarantee of future work.",
  },
  {
    title: "Set rate and availability",
    body: "Set a daily rate per category, then turn availability on. Block days off when you cannot work. Pause with one switch.",
  },
  {
    title: "Receive a booking request",
    body: "A client books you. The request lands in Bookings as pending until you accept or decline.",
  },
  {
    title: "Accept the shift",
    body: "Accept once you can do the work. The client then pays. Guard shifts start without OTP; other categories start when the client shares a 6-digit code in person.",
  },
  {
    title: "Complete the shift",
    body: "End duty the same way you started it. Hours are logged. You can then mark the booking complete.",
  },
  {
    title: "Receive the payout",
    body: "A settlement is issued for that booking, with TCS and TDS withheld where they apply, then released to your confirmed bank account.",
  },
];

const PAYMENT_STEPS = [
  {
    title: "Booking accepted",
    body: "You accept a request. Nothing is paid to you yet.",
  },
  {
    title: "Client pays",
    body: "The client pays their total — your rate, plus the platform fee and taxes billed to them.",
  },
  {
    title: "Shift starts and ends",
    body: "Duty is signed off with OTP (or a guard confirm). Starting duty does not release an advance on current bookings.",
  },
  {
    title: "Settlement calculated",
    body: "Your payable is your listed rate (plus service GST if you are GST-registered). TCS and, where it applies, TDS are withheld.",
  },
  {
    title: "Payout to your bank",
    body: "Once bank details are verified by our team and confirmed by you, the net amount is sent via Razorpay Route, with a UTR when released.",
  },
];

const BENEFITS = [
  {
    icon: "clipboard" as const,
    title: "Booking requests in one list",
    body: "Pending, accepted and completed shifts live on Bookings, with the same actions on the list and the detail page.",
  },
  {
    icon: "receipt" as const,
    title: "A settlement for every completed booking",
    body: "Gross, TCS, TDS and net are itemised. You can also download tax documents for the same booking.",
  },
  {
    icon: "clipboard-check" as const,
    title: "Duty signed off digitally",
    body: "OTP start and end for most categories; gate-guard bookings use an on-site confirm. The record is the hours the client signed.",
  },
  {
    icon: "shield-check" as const,
    title: "A verified professional profile",
    body: "Clients book against a profile the team has reviewed. Verification is a document check, not an endorsement of how you will work.",
  },
  {
    icon: "life-ring" as const,
    title: "Safety tools on duty",
    body: "SOS and live check-in while a shift is in progress, incident notes after, and in-app chat so you need not share a personal number.",
  },
  {
    icon: "chat" as const,
    title: "Support tickets in the app",
    body: "Raise a booking, payout or account issue and follow it in Support. Written grievances also go to grievance@20fourr.com.",
  },
];

const INDIVIDUAL_DOCS = [
  "Aadhaar card",
  "PAN card",
  "Selfie / live face verification",
  "Bank account proof",
  "Police verification / background check",
  "Past employment check",
  "Self-declaration of PSARA compliance",
];

const FIRM_DOCS = [
  "PAN card",
  "GST registration",
  "Certificate of incorporation / partnership / proprietorship proof",
  "Authorised signatory ID",
  "PSARA licence for the states you cover",
  "Registered-office address proof",
  "Bank account proof",
  "Police verification, past employment check, and self-declaration",
];

const FAQS = [
  {
    q: "How does verification work?",
    a: "You upload the documents required for an individual or a firm. Our team reviews them and sets your profile as verified. Until then you can finish profile, documents, pricing and bank details, but you cannot accept bookings or turn availability on. Verification is a document check — it is not a certification of service quality.",
  },
  {
    q: "What documents do I need?",
    a: "Individuals must upload Aadhaar, PAN, a live selfie, bank proof, police verification, a past-employment check, and a PSARA self-declaration. Firms must upload PAN, GST, incorporation proof, signatory ID, a PSARA licence, office address proof, bank proof, and the same compliance trio. Extra licences (firearms, training, EPF/ESIC) are optional and only where they apply.",
  },
  {
    q: "How much commission does 20fourr charge?",
    a: "The platform fee is billed to the client, not taken off your listed daily rate. The current default is 15% of your pre-GST rate, plus 18% GST on that fee. Those rates are platform settings and can change; each booking locks the rates in force when it is quoted.",
  },
  {
    q: "When do I get paid?",
    a: "After the shift is signed off. Current bookings use a single settlement after duty-end — there is no 30% advance when you start. The net amount (your rate, plus service GST if you are registered, minus TCS and TDS where they apply) is released to the bank account you submitted, the team verified, and you confirmed.",
  },
  {
    q: "How do I find jobs?",
    a: "You do not search a job board. Clients book a verified, available provider. Requests appear in Bookings for you to accept or decline. Turn availability on, keep days-off accurate, and offer the categories you actually work.",
  },
  {
    q: "Can I choose my availability?",
    a: "Yes. A single switch marks you available or paused. Days off block every category for that date. Working hours are shown on your profile; there is no per-day or per-category editor for an individual. Firms manage headcount separately once that surface is live.",
  },
  {
    q: "What happens if a client cancels?",
    a: "The platform may help find another provider where possible, and does not guarantee a replacement. Cancellation, refunds to the client, and any effect on your payout follow the booking and payment state at the time — raise a Support ticket for that booking if you need the record checked.",
  },
  {
    q: "How do I contact support?",
    a: "Use Support in the app to open a ticket on a booking, payout or account issue. You can also write to grievance@20fourr.com.",
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <LandingNav />

      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <h1 id="hero-heading" className={styles.heroHeadline}>
                Get booked. Work. Get paid.
              </h1>
              <p className={styles.heroSub}>
                Join 20fourr, get verified, choose relevant opportunities, set
                your rate and receive payments directly.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/register" className={styles.heroPrimary}>
                  Start earning
                  <Icon name="arrow-right" size={16} />
                </Link>
                <a href="#how-it-works" className={styles.heroSecondary}>
                  How it works
                </a>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.productFrame} aria-hidden="false">
                <div className={styles.productBar}>
                  <span className={styles.productBrand}>20fourr Provider</span>
                  <Badge tone="active">Verified</Badge>
                </div>
                <p className={styles.productRole}>Security professional</p>
                <p className={styles.productMeta}>
                  Profile, bookings and settlements — the same screens you use
                  after you sign in.
                </p>
                <div className={styles.productJob}>
                  <div className={styles.productJobHead}>
                    <div>
                      <p className={styles.productJobClient}>Booking request</p>
                      <p className={styles.productJobWhen}>Date · start–end time</p>
                      <p className={styles.productJobWhere}>
                        Security guard · your listed city
                      </p>
                    </div>
                    <div className={styles.productJobAmount}>
                      <p className={styles.productJobRate}>Your daily rate</p>
                      <Badge tone="action">Pending</Badge>
                    </div>
                  </div>
                  <p className={styles.productJobAction}>Accept or decline</p>
                </div>
              </div>
              <p className={styles.heroCaption}>
                Example of the provider app. Not a live account, rating, or
                earnings figure.
              </p>
            </div>
          </div>
        </section>

        <section id="earnings" className={styles.section} aria-labelledby="earnings-heading">
          <div className={styles.sectionInner}>
            <h2 id="earnings-heading" className={styles.sectionTitle}>
              What you earn is the rate you set
            </h2>
            <p className={styles.sectionSub}>
              You keep your listed daily rate. The platform fee is invoiced to
              the client. Statutory withholding is taken at settlement, not as
              a second commission.
            </p>

            <div className={styles.ledger}>
              <p className={styles.ledgerKicker}>
                Worked example at the current default rates — a ₹4,000 shift,
                unregistered individual, PAN verified, under the annual TDS
                threshold
              </p>
              <dl className={styles.ledgerList}>
                <div className={styles.ledgerRow}>
                  <dt>Your listed daily rate</dt>
                  <dd>₹4,000</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>
                    Platform fee billed to the client
                    <span className={styles.ledgerHint}>15% of your rate</span>
                  </dt>
                  <dd className={styles.ledgerMuted}>₹600</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>
                    GST on that fee, billed to the client
                    <span className={styles.ledgerHint}>18% of the fee</span>
                  </dt>
                  <dd className={styles.ledgerMuted}>₹108</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>Client pays</dt>
                  <dd>₹4,708</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>
                    TCS withheld from your settlement
                    <span className={styles.ledgerHint}>0.5% of your rate</span>
                  </dt>
                  <dd>− ₹20</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>
                    TDS under 194-O
                    <span className={styles.ledgerHint}>
                      Nil here — individuals with a verified PAN are exempt until
                      ₹5,00,000 of gross in the financial year
                    </span>
                  </dt>
                  <dd>₹0</dd>
                </div>
                <div className={`${styles.ledgerRow} ${styles.ledgerTotal}`}>
                  <dt>You receive</dt>
                  <dd>₹3,980</dd>
                </div>
              </dl>
              <p className={styles.ledgerNote}>
                GST-registered providers also collect 18% service GST on the
                rate (remitted by you) and have TDS from the first rupee if they
                are a firm. Without a verified PAN, TDS is 5%. Daily rates must
                sit between ₹100 and ₹1,00,000. Figures above use the platform’s
                current default settings; a live booking uses the rates locked
                at quote time.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="value-heading">
          <div className={styles.sectionInner}>
            <h2 id="value-heading" className={styles.sectionTitle}>
              How the work actually runs
            </h2>
            <p className={styles.sectionSub}>
              Four things you control on 20fourr — rate, bookings, verification
              and payout — and nothing that the product does not do.
            </p>
            <div className={styles.valueGrid}>
              {VALUE_CARDS.map((card) => (
                <article key={card.title} className={styles.valueCard}>
                  <span className={styles.valueIcon}>
                    <Icon name={card.icon} size={20} />
                  </span>
                  <h3 className={styles.valueTitle}>{card.title}</h3>
                  <p className={styles.valueBody}>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="job-heading">
          <div className={styles.sectionInner}>
            <h2 id="job-heading" className={styles.sectionTitle}>
              What a booking looks like
            </h2>
            <p className={styles.sectionSub}>
              Same shape as Bookings in the app: who booked you, when, which
              category, and the amount. Accept or decline sits on pending
              requests.
            </p>
            <div className={styles.jobList}>
              <div className={styles.jobRow}>
                <div className={styles.jobHead}>
                  <div>
                    <p className={styles.jobClient}>Client name</p>
                    <p className={styles.jobWhen}>Start date, 09:00–17:00</p>
                    <p className={styles.jobWhere}>Security guard · 1 day</p>
                  </div>
                  <div className={styles.jobAmountCol}>
                    <p className={styles.jobAmount}>Your daily rate</p>
                    <Badge tone="action">Pending</Badge>
                  </div>
                </div>
                <div className={styles.jobLinks}>
                  <span className={styles.jobLink}>View details</span>
                  <span className={styles.jobGhost}>Accept</span>
                  <span className={styles.jobGhost}>Decline</span>
                </div>
              </div>
            </div>
            <p className={styles.tableNote}>
              Sample layout using the fields on a real booking. Not an open
              assignment.
            </p>
          </div>
        </section>

        <section id="how-it-works" className={styles.sectionAlt} aria-labelledby="journey-heading">
          <div className={styles.sectionInner}>
            <h2 id="journey-heading" className={styles.sectionTitle}>
              From registration to payout
            </h2>
            <p className={styles.sectionSub}>
              The path every provider follows. Nothing here is skipped, and
              nothing extra is invented.
            </p>
            <ol className={styles.steps}>
              {JOURNEY.map((step, index) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNum}>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.stepText}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepBody}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="verification" className={styles.section} aria-labelledby="verify-heading">
          <div className={styles.sectionInner}>
            <h2 id="verify-heading" className={styles.sectionTitle}>
              Your profile. Verified and ready for work.
            </h2>
            <p className={styles.sectionSub}>
              Verification means the documents you uploaded have been reviewed.
              It does not guarantee bookings, and it does not certify how you
              will perform on a shift.
            </p>

            <div className={styles.verifyGrid}>
              <div className={styles.verifyCol}>
                <h3 className={styles.verifyTitle}>Individuals</h3>
                <ul className={styles.docList}>
                  {INDIVIDUAL_DOCS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.verifyCol}>
                <h3 className={styles.verifyTitle}>Firms and agencies</h3>
                <ul className={styles.docList}>
                  {FIRM_DOCS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.verifyFoot}>
              <p>
                After you upload every required file, the checklist tells you
                the team has what it needs. When review finishes, a verified
                badge appears in the app and you can accept work and switch
                availability on. Add and confirm a bank account before the
                first payout can be released.
              </p>
              <Link href="/register" className={styles.textLink}>
                Create an account to start the checklist
              </Link>
            </div>
          </div>
        </section>

        <section id="payments" className={styles.sectionAlt} aria-labelledby="pay-heading">
          <div className={styles.sectionInner}>
            <h2 id="pay-heading" className={styles.sectionTitle}>
              How payment moves
            </h2>
            <p className={styles.sectionSub}>
              Current bookings settle once, after duty-end. Older bookings used
              a 30/70 split; new work does not.
            </p>
            <ol className={styles.paySteps}>
              {PAYMENT_STEPS.map((step, index) => (
                <li key={step.title} className={styles.payStep}>
                  <span className={styles.payNum}>{String(index + 1).padStart(2, "0")}</span>
                  <h3 className={styles.payTitle}>{step.title}</h3>
                  <p className={styles.payBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="benefits-heading">
          <div className={styles.sectionInner}>
            <h2 id="benefits-heading" className={styles.sectionTitle}>
              What you have in the app
            </h2>
            <div className={styles.features}>
              {BENEFITS.map((item) => (
                <div key={item.title} className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Icon name={item.icon} size={20} />
                  </span>
                  <div>
                    <h3 className={styles.featureTitle}>{item.title}</h3>
                    <p className={styles.featureBody}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="categories-heading">
          <div className={styles.sectionInner}>
            <h2 id="categories-heading" className={styles.sectionTitle}>
              Four categories, one profile
            </h2>
            <p className={styles.sectionSub}>
              Individuals and registered agencies. Offer one category or all
              four — you choose, and you can change it later.
            </p>
            <div className={styles.categoryGrid}>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="building" size={24} />
                </span>
                <h3 className={styles.categoryName}>Security guard</h3>
                <p className={styles.categoryDesc}>
                  Gate guard, property protection, and perimeter duty for
                  residential and commercial premises.
                </p>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="stanchion" size={24} />
                </span>
                <h3 className={styles.categoryName}>Bouncer</h3>
                <p className={styles.categoryDesc}>
                  Event security, crowd control, and venue access for concerts,
                  clubs, and gatherings.
                </p>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="target" size={24} />
                </span>
                <h3 className={styles.categoryName}>Armed guard (gunman)</h3>
                <p className={styles.categoryDesc}>
                  Licensed armed escort and asset protection. A firearms licence
                  is required where you offer this category.
                </p>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="person-shield" size={24} />
                </span>
                <h3 className={styles.categoryName}>Personal security officer</h3>
                <p className={styles.categoryDesc}>
                  Close protection for individuals, executives, and VIPs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.trustStrip}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustCheck}>
                <Icon name="check" size={13} />
              </div>
              <div>
                <p className={styles.trustItemTitle}>PSARA-aware onboarding</p>
                <p className={styles.trustItemBody}>
                  Firms upload a PSARA licence. Individuals declare PSARA
                  compliance. The platform is a marketplace, not your employer.
                </p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustCheck}>
                <Icon name="check" size={13} />
              </div>
              <div>
                <p className={styles.trustItemTitle}>DPDP Act 2023</p>
                <p className={styles.trustItemBody}>
                  Account data export, consent withdrawal, and erasure requests
                  live in Account.
                </p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustCheck}>
                <Icon name="check" size={13} />
              </div>
              <div>
                <p className={styles.trustItemTitle}>Razorpay Route</p>
                <p className={styles.trustItemBody}>
                  Settlements deposit to the bank account you confirmed, after
                  the team has verified it.
                </p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustCheck}>
                <Icon name="check" size={13} />
              </div>
              <div>
                <p className={styles.trustItemTitle}>Indian law</p>
                <p className={styles.trustItemBody}>
                  Disputes under the Arbitration &amp; Conciliation Act, 1996,
                  as set out in the Terms.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section id="faq" className={styles.section} aria-labelledby="faq-heading">
          <div className={styles.sectionInnerNarrow}>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              Questions before you join
            </h2>
            <div className={styles.faqList}>
              {FAQS.map((item) => (
                <details key={item.q} className={styles.faqItem}>
                  <summary className={styles.faqSummary}>
                    {item.q}
                    <Icon name="chevron" size={18} />
                  </summary>
                  <p className={styles.faqAnswer}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaBanner} aria-labelledby="cta-heading">
          <div className={styles.ctaInner}>
            <h2 id="cta-heading" className={styles.ctaTitle}>
              Ready to start earning?
            </h2>
            <p className={styles.ctaSub}>
              Create your profile, complete verification and start receiving
              booking requests on 20fourr.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/register" className={styles.ctaButton}>
                Start earning
              </Link>
              <Link href="/login" className={styles.ctaSecondary}>
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerWordmark}>
              20fourr
            </Link>
            <p className={styles.footerTagline}>
              The marketplace for verified security professionals.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/login" className={styles.footerLink}>
              Sign in
            </Link>
            <Link href="/register" className={styles.footerLink}>
              Register
            </Link>
            <Link href="/terms" className={styles.footerLink}>
              Terms &amp; Privacy
            </Link>
            <a href="mailto:grievance@20fourr.com" className={styles.footerLink}>
              grievance@20fourr.com
            </a>
          </div>
        </div>
        <hr className={styles.footerDivider} />
        <p className={styles.footerCopyright}>
          © 2026 20fourr. All rights reserved. Indorize Technologies Pvt. Ltd.
        </p>
      </footer>
    </div>
  );
}
