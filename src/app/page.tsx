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
    body: "Pick your categories and a daily rate for each. ₹100–₹1,00,000, shifts of 4–24 hours. Change it later on Availability.",
  },
  {
    icon: "clipboard" as const,
    title: "Receive bookings",
    body: "Clients book you. You accept or decline. There is no public job board to browse.",
  },
  {
    icon: "shield-check" as const,
    title: "Get verified",
    body: "Upload the documents for your account type. Review happens once. Accepting work waits on that review.",
  },
  {
    icon: "building" as const,
    title: "Get paid",
    body: "After duty is signed off, the settlement goes to the bank account you confirmed. Not instant.",
  },
];

const JOURNEY = [
  { title: "Create your profile", body: "Individual or firm, city, categories, experience." },
  { title: "Complete verification", body: "Upload KYC. Firms add a PSARA licence. Review is a document check, not a guarantee of work." },
  { title: "Set rate and availability", body: "Daily rate per category. One switch to go live. Days off when you cannot work." },
  { title: "Receive a booking", body: "It lands in Bookings as pending until you respond." },
  { title: "Accept the shift", body: "Client pays after you accept. Guards start on confirm; other categories use a 6-digit client OTP." },
  { title: "Complete the shift", body: "End duty the same way you started. Hours are logged." },
  { title: "Receive the payout", body: "Settlement with TCS/TDS where they apply, then Razorpay Route to your confirmed bank." },
];

const PAYMENT_STEPS = [
  { title: "Accepted", body: "No payout yet." },
  { title: "Client pays", body: "Your rate plus their platform fee." },
  { title: "Duty signed off", body: "OTP or guard confirm. No advance on start." },
  { title: "Settled", body: "Rate, minus TCS/TDS where due." },
  { title: "Paid out", body: "To your confirmed bank, with UTR." },
];

const FEATURES = [
  {
    icon: "shield-check" as const,
    title: "Verified profile",
    body: "Clients book a profile the team has reviewed. That is a document check, not a quality certificate.",
    visual: "verified" as const,
  },
  {
    icon: "receipt" as const,
    title: "Bank-direct payouts",
    body: "Each completed booking gets a settlement: gross, tax withheld, net to your bank.",
    visual: "payout" as const,
  },
  {
    icon: "clipboard-check" as const,
    title: "Duty signed off",
    body: "Six-digit client OTP for most categories. Gate-guard bookings use an on-site confirm.",
    visual: "otp" as const,
  },
  {
    icon: "life-ring" as const,
    title: "Safety on duty",
    body: "SOS and check-in while a shift is live. Chat stays in the app.",
    visual: "safety" as const,
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

function FeatureVisual({ kind }: { kind: "verified" | "payout" | "otp" | "safety" }) {
  if (kind === "verified") {
    return (
      <div className={styles.miniUi} aria-hidden="true">
        <span className={styles.miniVerified}>
          <Icon name="check" size={12} />
          Verified
        </span>
        <span className={styles.miniMuted}>On your profile after review</span>
      </div>
    );
  }
  if (kind === "payout") {
    return (
      <div className={styles.miniUi} aria-hidden="true">
        <p className={styles.miniLabel}>Settlement</p>
        <p className={styles.miniLine}>
          <span>Gross</span>
          <span>Your rate</span>
        </p>
        <p className={styles.miniLine}>
          <span>TCS / TDS</span>
          <span>Withheld</span>
        </p>
        <p className={`${styles.miniLine} ${styles.miniStrong}`}>
          <span>Net</span>
          <span>To your bank</span>
        </p>
      </div>
    );
  }
  if (kind === "otp") {
    return (
      <div className={styles.miniUi} aria-hidden="true">
        <p className={styles.miniLabel}>Start duty</p>
        <div className={styles.otpBoxes}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={styles.otpBox} />
          ))}
        </div>
        <span className={styles.miniGhost}>Confirm</span>
      </div>
    );
  }
  return (
    <div className={styles.miniUi} aria-hidden="true">
      <p className={styles.miniSos}>SOS</p>
      <span className={styles.miniMuted}>On duty_started bookings</span>
    </div>
  );
}

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
                Get booked. Work.{" "}
                <span className={styles.heroClose}>Get paid.</span>
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
              <div className={styles.productFrame}>
                <div className={styles.productChrome}>
                  <span className={styles.productBrand}>20fourr Provider</span>
                  <span className={styles.verifiedChip}>
                    <Icon name="check" size={12} />
                    Verified
                  </span>
                </div>
                <div className={styles.productIdentity}>
                  <span className={styles.productAvatar} aria-hidden="true">
                    SP
                  </span>
                  <div>
                    <p className={styles.productRole}>Security professional</p>
                    <p className={styles.productPlace}>Your city · your state</p>
                  </div>
                </div>
                <dl className={styles.productFields}>
                  <div>
                    <dt>Availability</dt>
                    <dd>You switch this on</dd>
                  </div>
                  <div>
                    <dt>Daily rate</dt>
                    <dd>₹100–₹1,00,000</dd>
                  </div>
                  <div>
                    <dt>Hours / day</dt>
                    <dd>4–24</dd>
                  </div>
                  <div>
                    <dt>Rating</dt>
                    <dd>From completed work</dd>
                  </div>
                </dl>
                <div className={styles.productJob}>
                  <div className={styles.productJobHead}>
                    <div>
                      <p className={styles.productJobClient}>Booking request</p>
                      <p className={styles.productJobWhen}>Start date · 09:00–17:00</p>
                      <p className={styles.productJobWhere}>Security guard · 1 day</p>
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
                Layout of the provider app. Not a live account, rating, or
                payout figure.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="value-heading">
          <div className={styles.sectionInner}>
            <h2 id="value-heading" className={styles.sectionTitle}>
              Why providers use 20fourr
            </h2>
            <p className={styles.sectionSub}>
              Rate, bookings, verification, payout — the four things you control.
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

        <section id="earnings" className={styles.section} aria-labelledby="earnings-heading">
          <div className={styles.sectionInner}>
            <h2 id="earnings-heading" className={styles.sectionTitle}>
              What you earn is the rate you set
            </h2>
            <p className={styles.sectionSub}>
              You keep your listed daily rate. The platform fee is invoiced to
              the client.
            </p>

            <div className={styles.ledger}>
              <div className={styles.earnHero}>
                <p className={styles.earnLabel}>You receive</p>
                <p className={styles.earnBig}>₹3,980</p>
                <p className={styles.earnCaption}>
                  Worked example: ₹4,000 listed rate, unregistered individual,
                  verified PAN, under the annual TDS threshold.
                </p>
              </div>
              <dl className={styles.ledgerList}>
                <div className={styles.ledgerRow}>
                  <dt>Your listed daily rate</dt>
                  <dd>₹4,000</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>
                    Platform fee, billed to the client
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
                    TCS withheld at settlement
                    <span className={styles.ledgerHint}>0.5% of your rate</span>
                  </dt>
                  <dd>− ₹20</dd>
                </div>
                <div className={styles.ledgerRow}>
                  <dt>
                    TDS under 194-O
                    <span className={styles.ledgerHint}>Nil in this example</span>
                  </dt>
                  <dd>₹0</dd>
                </div>
                <div className={`${styles.ledgerRow} ${styles.ledgerTotal}`}>
                  <dt>You receive</dt>
                  <dd>₹3,980</dd>
                </div>
              </dl>
              <details className={styles.ledgerDetails}>
                <summary>How this example is calculated</summary>
                <p>
                  GST-registered providers also collect 18% service GST on the
                  rate (remitted by you) and have TDS from the first rupee if
                  they are a firm. Without a verified PAN, TDS is 5%. Daily
                  rates must sit between ₹100 and ₹1,00,000. Figures use the
                  platform’s current default settings; a live booking uses the
                  rates locked at quote time. Individuals with a verified PAN
                  have no TDS until ₹5,00,000 of gross in the financial year.
                </p>
              </details>
            </div>

            <div className={styles.inlineCta}>
              <div>
                <p className={styles.inlineCtaTitle}>Ready to start earning?</p>
                <p className={styles.inlineCtaBody}>
                  Create your profile, complete verification, start receiving
                  booking requests.
                </p>
              </div>
              <Link href="/register" className={styles.inlineCtaButton}>
                Start earning
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className={styles.sectionAlt} aria-labelledby="journey-heading">
          <div className={styles.sectionInner}>
            <h2 id="journey-heading" className={styles.sectionTitle}>
              From registration to payout
            </h2>
            <p className={styles.sectionSub}>The path every provider follows.</p>
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

        <section className={styles.section} aria-labelledby="job-heading">
          <div className={styles.sectionInner}>
            <h2 id="job-heading" className={styles.sectionTitle}>
              What a booking looks like
            </h2>
            <p className={styles.sectionSub}>
              Same fields as Bookings: category, date, time, your rate, pending
              until you respond.
            </p>
            <div className={styles.jobList}>
              <div className={styles.jobRow}>
                <div className={styles.jobHead}>
                  <div>
                    <p className={styles.jobClient}>Security guard</p>
                    <p className={styles.jobWhen}>Start date, 09:00–17:00</p>
                    <p className={styles.jobWhere}>1 day · your listed city</p>
                  </div>
                  <div className={styles.jobAmountCol}>
                    <p className={styles.jobAmount}>Your daily rate</p>
                    <Badge tone="action">Pending</Badge>
                  </div>
                </div>
                <div className={styles.jobLinks}>
                  <span className={styles.jobLink}>View details</span>
                  <span className={styles.jobAccept}>Accept</span>
                  <span className={styles.jobGhost}>Decline</span>
                </div>
              </div>
            </div>
            <p className={styles.tableNote}>
              Sample layout of a real booking request. Not an open assignment.
            </p>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="benefits-heading">
          <div className={styles.sectionInner}>
            <h2 id="benefits-heading" className={styles.sectionTitle}>
              What you have in the app
            </h2>
            <div className={styles.featureGrid}>
              {FEATURES.map((item) => (
                <article key={item.title} className={styles.featureCard}>
                  <span className={styles.featureIcon}>
                    <Icon name={item.icon} size={20} />
                  </span>
                  <h3 className={styles.featureTitle}>{item.title}</h3>
                  <p className={styles.featureBody}>{item.body}</p>
                  <FeatureVisual kind={item.visual} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="verification" className={styles.section} aria-labelledby="verify-heading">
          <div className={styles.sectionInner}>
            <h2 id="verify-heading" className={styles.sectionTitle}>
              Your profile. Verified and ready for work.
            </h2>
            <p className={styles.sectionSub}>
              Verification means your documents have been reviewed. It does not
              guarantee bookings or certify how you will perform.
            </p>
            <div className={styles.verifyGrid}>
              <details className={styles.docDetails}>
                <summary>Documents for individuals</summary>
                <ul className={styles.docList}>
                  {INDIVIDUAL_DOCS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
              <details className={styles.docDetails}>
                <summary>Documents for firms and agencies</summary>
                <ul className={styles.docList}>
                  {FIRM_DOCS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            </div>
            <div className={styles.verifyFoot}>
              <p>
                When every required file is in, the team reviews. A verified
                badge means you can accept work and switch availability on.
                Confirm a bank account before the first payout.
              </p>
              <Link href="/register" className={styles.textLink}>
                Start earning
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
              One settlement after duty-end. No 30/70 split on current bookings.
            </p>
            <ol className={styles.paySteps}>
              {PAYMENT_STEPS.map((step) => (
                <li key={step.title} className={styles.payStep}>
                  <h3 className={styles.payTitle}>{step.title}</h3>
                  <p className={styles.payBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="categories-heading">
          <div className={styles.sectionInner}>
            <h2 id="categories-heading" className={styles.sectionTitle}>
              Four categories, one profile
            </h2>
            <p className={styles.sectionSub}>
              Individuals and agencies. Offer one category or all four.
            </p>
            <div className={styles.categoryGrid}>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="building" size={24} />
                </span>
                <h3 className={styles.categoryName}>Security guard</h3>
                <p className={styles.categoryDesc}>
                  Gate, property, and perimeter duty.
                </p>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="stanchion" size={24} />
                </span>
                <h3 className={styles.categoryName}>Bouncer</h3>
                <p className={styles.categoryDesc}>
                  Events, crowd control, venue access.
                </p>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="target" size={24} />
                </span>
                <h3 className={styles.categoryName}>Armed guard (gunman)</h3>
                <p className={styles.categoryDesc}>
                  Licensed armed escort. Firearms licence required for this
                  category.
                </p>
              </div>
              <div className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon name="person-shield" size={24} />
                </span>
                <h3 className={styles.categoryName}>Personal security officer</h3>
                <p className={styles.categoryDesc}>
                  Close protection for individuals and executives.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.trustStrip}>
          <div className={styles.trustIntro}>
            <h2 className={styles.trustHeading}>Why the platform is set up this way</h2>
            <p className={styles.trustLead}>Compliance detail — not a marketing claim.</p>
          </div>
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
                  Data export, consent withdrawal, and erasure live in Account.
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
                  Settlements go to the bank account you confirmed, after the
                  team has verified it.
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
                <details key={item.q} name="landing-faq" className={styles.faqItem}>
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
