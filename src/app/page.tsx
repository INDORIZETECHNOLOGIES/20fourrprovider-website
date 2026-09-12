import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "20fourr for Providers — Get booked. Work. Get paid.",
  // Payouts settle after a completed shift and admin verification — this used to
  // claim "instant payouts", which isn't what the product does.
  description:
    "One verified profile, bookings from clients across India, and payouts to your bank after every completed shift — for guards, bouncers, armed guards and PSOs.",
};

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ── Navigation ── */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navWordmark}>
          20fourr<span className={styles.navWordmarkDot} />
        </Link>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navSignIn}>
            Sign in
          </Link>
          <Link href="/register" className={styles.navCta}>
            Create account
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeadline}>Get booked. Work. Get paid.</h1>

          <p className={styles.heroSub}>
            For guards, bouncers, armed guards and personal security officers.
            One verified profile, bookings from clients across India, and
            payouts straight to your bank — every shift tracked and signed off.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/register" className={styles.heroPrimary}>
              Create your account
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link href="/login" className={styles.heroSecondary}>
              Already registered? Sign in
            </Link>
          </div>
        </div>

        {/* CSS credential card illustration — captioned, because it shows a
            person, a rating and a shift count that aren't anybody's real record. */}
        <div className={styles.heroVisual}>
          <div className={styles.credCard}>
            <div className={styles.credCardChip} />
            <div className={styles.credCardTop}>
              <span className={styles.credCardLogo}>20fourr</span>
              <span className={styles.credCardBadge}>Verified</span>
            </div>
            <div className={styles.credCardAvatar}>R</div>
            <p className={styles.credCardName}>Rajesh Kumar</p>
            <p className={styles.credCardRole}>Personal security officer · Mumbai</p>
            <div className={styles.credCardStats}>
              <div className={styles.credCardStat}>
                <span className={styles.credCardStatValue}>48</span>
                <span className={styles.credCardStatLabel}>Shifts</span>
              </div>
              <div className={styles.credCardStat}>
                <span className={styles.credCardStatValue}>4.9</span>
                <span className={styles.credCardStatLabel}>Rating</span>
              </div>
              <div className={styles.credCardStat}>
                <span className={styles.credCardStatValue}>6 yr</span>
                <span className={styles.credCardStatLabel}>Experience</span>
              </div>
            </div>
          </div>
          <p className={styles.credCardCaption}>
            An example profile — this is how your verified profile appears to clients.
          </p>
        </div>
      </section>

      {/* ── What you can earn — the first question a provider asks, so it comes
          first rather than sitting second-to-last. ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>What can you earn?</h2>
          <p className={styles.sectionSub}>
            You set your own daily rate on your profile. The ranges below are
            illustrative — actual earnings depend on your category, experience,
            and the bookings you accept.
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.rateTable}>
              <thead className={styles.rateTableHead}>
                <tr>
                  <th>Service category</th>
                  <th>Typical daily rate</th>
                  <th>Hours / day</th>
                </tr>
              </thead>
              <tbody className={styles.rateTableBody}>
                <tr>
                  <td>Security guard</td>
                  <td className={styles.rateRange}>₹800 – ₹1,500</td>
                  <td>8 – 12 hrs</td>
                </tr>
                <tr>
                  <td>Bouncer</td>
                  <td className={styles.rateRange}>₹1,000 – ₹2,000</td>
                  <td>8 hrs</td>
                </tr>
                <tr>
                  <td>Armed guard (gunman)</td>
                  <td className={styles.rateRange}>₹1,500 – ₹3,000</td>
                  <td>8 – 12 hrs</td>
                </tr>
                <tr>
                  <td>Personal security officer</td>
                  <td className={styles.rateRange}>₹2,500 – ₹6,000</td>
                  <td>10 – 12 hrs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className={styles.tableNote}>
            Rates are set entirely by you on your profile. A platform fee is
            deducted from client payments before settlement.{" "}
            <Link href="/register">Set your rate</Link>
          </p>
        </div>
      </section>

      {/* ── How it works — a real sequence, so it reads as one. ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            Three steps from registration to your first payout
          </h2>
          <p className={styles.sectionSub}>
            No intermediaries, no cash handling. Everything happens through
            the platform.
          </p>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <div className={styles.stepText}>
                <h3 className={styles.stepTitle}>Register and get verified</h3>
                <p className={styles.stepBody}>
                  Create your account, upload your KYC documents and PSARA
                  licence. Our team verifies you once — no repeat paperwork per
                  client.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <div className={styles.stepText}>
                <h3 className={styles.stepTitle}>Set your services and rates</h3>
                <p className={styles.stepBody}>
                  Choose which of the four categories you offer, set your own
                  daily rate for each, and mark when you&apos;re available. Pause
                  any time with a single switch.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <div className={styles.stepText}>
                <h3 className={styles.stepTitle}>Accept work and get paid</h3>
                <p className={styles.stepBody}>
                  Clients book you. Accept the request, start duty with an OTP,
                  end duty with an OTP. Your payout settles to your bank after
                  the shift is signed off.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            Everything you need. Nothing you don&apos;t.
          </h2>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><Icon name="shield-check" size={20} /></span>
              <div>
                <h3 className={styles.featureTitle}>One-time PSARA verification</h3>
                <p className={styles.featureBody}>
                  Submit your licence once. Work with any client on the platform
                  without re-verifying for each booking.
                </p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><Icon name="receipt" size={20} /></span>
              <div>
                <h3 className={styles.featureTitle}>Bank-direct payouts</h3>
                <p className={styles.featureBody}>
                  Earnings settle to your bank account after each completed
                  shift. TDS and TCS deducted and reported for you.
                </p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><Icon name="clipboard-check" size={20} /></span>
              <div>
                <h3 className={styles.featureTitle}>Every shift signed off</h3>
                <p className={styles.featureBody}>
                  OTP-based shift start and end. Your hours are logged and
                  signed off by the client — no disputes over time worked.
                </p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><Icon name="life-ring" size={20} /></span>
              <div>
                <h3 className={styles.featureTitle}>Safety built into every duty</h3>
                <p className={styles.featureBody}>
                  An SOS button and live check-ins while you&apos;re on duty, and
                  in-app chat with the client so you never share your personal
                  number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories — the one card treatment on the page. ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Four categories, one profile</h2>
          <p className={styles.sectionSub}>
            Open to individual professionals and to registered security
            agencies. Offer one category or all four — you choose, and you can
            change it later.
          </p>

          <div className={styles.categoryGrid}>
            <div className={styles.categoryCard}>
              <span className={styles.categoryIcon}><Icon name="building" size={24} /></span>
              <h3 className={styles.categoryName}>Security guard</h3>
              <p className={styles.categoryDesc}>
                Gate guard, property protection, and perimeter duty for
                residential and commercial premises.
              </p>
            </div>
            <div className={styles.categoryCard}>
              <span className={styles.categoryIcon}><Icon name="stanchion" size={24} /></span>
              <h3 className={styles.categoryName}>Bouncer</h3>
              <p className={styles.categoryDesc}>
                Event security, crowd control, and venue access management
                for concerts, clubs, and gatherings.
              </p>
            </div>
            <div className={styles.categoryCard}>
              <span className={styles.categoryIcon}><Icon name="target" size={24} /></span>
              <h3 className={styles.categoryName}>Armed guard (gunman)</h3>
              <p className={styles.categoryDesc}>
                Licensed armed escort and asset protection. Weapon licence
                required at registration.
              </p>
            </div>
            <div className={styles.categoryCard}>
              <span className={styles.categoryIcon}><Icon name="person-shield" size={24} /></span>
              <h3 className={styles.categoryName}>Personal security officer</h3>
              <p className={styles.categoryDesc}>
                Close protection for individuals, executives, and VIPs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className={styles.trustStrip}>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Icon name="check" size={13} /></div>
            <div>
              <p className={styles.trustItemTitle}>PSARA-compliant</p>
              <p className={styles.trustItemBody}>
                All providers verified under the Private Security Agencies
                Regulation Act.
              </p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Icon name="check" size={13} /></div>
            <div>
              <p className={styles.trustItemTitle}>DPDP Act 2023</p>
              <p className={styles.trustItemBody}>
                Your data handled under India&apos;s Digital Personal Data
                Protection Act.
              </p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Icon name="check" size={13} /></div>
            <div>
              <p className={styles.trustItemTitle}>Razorpay-powered</p>
              <p className={styles.trustItemBody}>
                Settlements via Razorpay Route, deposited directly to your
                verified bank account.
              </p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Icon name="check" size={13} /></div>
            <div>
              <p className={styles.trustItemTitle}>Governed by Indian law</p>
              <p className={styles.trustItemBody}>
                Disputes resolved under the Arbitration &amp; Conciliation
                Act, 1996.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to start earning?</h2>
          <p className={styles.ctaSub}>
            Create your free account in under 5 minutes. Verification usually
            completes within 24 hours. Your first booking could be this week.
          </p>
          <Link href="/register" className={styles.ctaButton}>
            Create your account
          </Link>
          <span className={styles.ctaSmall}>
            Already have an account? <Link href="/login" className={styles.ctaSmallLink}>Sign in</Link>
          </span>
        </div>
      </section>

      {/* ── Footer ── */}
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
