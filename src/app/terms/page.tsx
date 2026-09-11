import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms of Service & Privacy Policy — 20fourr",
  description:
    "The full agreement between you and 20fourr. Read before accepting during sign-up.",
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <Link href="/">
          <div className={styles.brand}>
            20fourr
          </div>
        </Link>
        <Link href="/register" className={styles.backLink}>
          ← Back to sign up
        </Link>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Terms of Service &amp; Privacy Policy</h1>
        <p className={styles.heroSubtitle}>
          The full agreement between you and 20fourr. Tick the consent box on
          the sign-up form once you have read it.
        </p>
        <div className={styles.heroBadges}>
          <span className={styles.badge}>Version 1.0</span>
          <span className={styles.badge}>Governed by the laws of India</span>
          <span className={styles.badge}>DPDP Act 2023 compliant</span>
        </div>
      </section>

      {/* Body */}
      <div className={styles.layout}>
        {/* Sidebar TOC */}
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocTitle}>Contents</p>
          <ul className={styles.tocList}>
            <li>
              <a href="#terms" className={styles.tocLink}>
                Part 1 — Terms of Service
              </a>
            </li>
            {[
              [1, "PSARA Compliance"],
              [2, "Acceptance of Terms"],
              [3, "Platform Role"],
              [4, "Independent Providers"],
              [5, "Legal Compliance"],
              [6, "Verification"],
              [7, "Client Due Diligence"],
              [8, "Insurance"],
              [9, "Payment Facilitation"],
              [10, "Cancellation Policy"],
              [11, "Limitation of Liability"],
              [12, "Indemnification"],
              [13, "Emergency Disclaimer"],
              [14, "Dispute Assistance"],
              [15, "Agreement Confirmation"],
              [16, "Identity Verification"],
              [17, "Jurisdiction"],
              [18, "Account Responsibility"],
              [19, "Prohibited Activities"],
              [20, "Suspension Rights"],
              [21, "Ratings & Reviews"],
              [22, "Service Availability"],
              [23, "Data & Privacy"],
              [24, "Modification of Terms"],
              [25, "Force Majeure"],
              [26, "Entire Agreement"],
              [27, "Severability"],
              [28, "Arbitration"],
              [29, "Class Action Waiver"],
              [30, "Chargebacks"],
              [31, "Background Checks"],
              [32, "Safety Reporting"],
              [33, "Prohibition of Illegal Use"],
              [34, "Platform Neutrality"],
              [35, "No Employer Relationship"],
              [36, "Off-Platform Prohibition"],
              [37, "Gate Security Disclaimer"],
              [38, "Grievance Mechanism"],
            ].map(([n, label]) => (
              <li key={n}>
                <a href={`#clause-${n}`} className={styles.tocLink}>
                  {n}. {label}
                </a>
              </li>
            ))}
            <li>
              <div className={styles.tocDivider} />
            </li>
            <li>
              <a href="#privacy" className={styles.tocLink}>
                Part 2 — Privacy Policy
              </a>
            </li>
            {[
              ["p1", "Information We Collect"],
              ["p2", "How We Use It"],
              ["p3", "Information Sharing"],
              ["p4", "Data Retention"],
              ["p5", "Data Security"],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#clause-${id}`} className={styles.tocLink}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Document */}
        <main className={styles.doc}>
          {/* ── PART 1 ── */}
          <div id="terms" className={styles.part}>
            <div className={styles.partLine} />
            <span className={styles.partLabel}>Part 1</span>
            <div className={styles.partLine} />
          </div>
          <h2 className={styles.partTitle}>
            20fourr Platform User Agreement / Terms of Service
          </h2>

          <div className={styles.clauses}>
            <Clause id="clause-1" num="01" title="PSARA Compliance">
              All security service providers registering on the platform must
              provide a valid license number under the Private Security Agencies
              Regulation Act (PSARA) at the time of registration and profile
              creation.
            </Clause>

            <Clause id="clause-2" num="02" title="Acceptance of Terms">
              All users, including clients and security service providers, must
              review and accept these Terms before accessing or using the
              platform.
            </Clause>

            <Clause id="clause-3" num="03" title="Platform Role (Marketplace Only)">
              The platform operates solely as a technology marketplace connecting
              clients with independent security service providers. The platform
              does not directly employ, manage, or control security personnel.
            </Clause>

            <Clause id="clause-4" num="04" title="Independent Service Providers">
              All providers listed on the platform operate as independent
              individuals or agencies and are solely responsible for the services
              they provide.
            </Clause>

            <Clause id="clause-5" num="05" title="Legal Compliance Responsibility">
              Security providers are responsible for complying with all
              applicable laws, regulations, and licensing requirements, including
              those related to private security operations.
            </Clause>

            <Clause id="clause-6" num="06" title="Verification of Providers">
              The platform may conduct basic verification of documents submitted
              by providers. Such verification does not constitute endorsement,
              certification, or guarantee of service quality.
            </Clause>

            <Clause id="clause-7" num="07" title="User Responsibility (Client Due Diligence)">
              Clients must independently evaluate the suitability of any
              provider before confirming a booking.
            </Clause>

            <Clause id="clause-8" num="08" title="Insurance Responsibility">
              Security providers are responsible for maintaining any required
              insurance, liability coverage, or professional certifications
              applicable to their services.
            </Clause>

            <Clause id="clause-9" num="09" title="Payment Facilitation">
              The platform may facilitate payments between clients and providers
              but acts solely as a payment intermediary.
            </Clause>

            <Clause id="clause-10" num="10" title="Cancellation and No-Show Policy">
              In case of cancellation, absence, or unavailability of a provider,
              the platform may assist in arranging an alternative provider where
              possible but does not guarantee replacement.
            </Clause>

            <Clause id="clause-11" num="11" title="Limitation of Liability">
              The platform shall not be liable for any injury, loss, damage, or
              misconduct arising from services arranged through the platform.
            </Clause>

            <Clause id="clause-12" num="12" title="Indemnification">
              Users agree to indemnify and hold the platform and its affiliates
              harmless from any claims or liabilities arising from their use of
              the platform.
            </Clause>

            <Clause id="clause-13" num="13" title="Emergency Disclaimer">
              The platform is not an emergency response service and should not be
              relied upon for immediate law enforcement or emergency protection.
            </Clause>

            <Clause id="clause-14" num="14" title="Dispute Assistance">
              Users may raise support requests through the platform. The platform
              may assist in communication but is not responsible for resolving
              disputes.
            </Clause>

            <Clause id="clause-15" num="15" title="Agreement Confirmation">
              By accepting these Terms, users acknowledge the platform's role as
              a facilitator and agree to use the services at their own risk.
            </Clause>

            <Clause id="clause-16" num="16" title="User Identity Verification">
              The platform may require identity verification for both clients and
              providers, including government identification, contact
              verification, or other authentication processes.
            </Clause>

            <Clause id="clause-17" num="17" title="Jurisdiction and Governing Law">
              These Terms shall be governed by the laws of India. Any disputes
              arising from the use of the platform shall fall under the exclusive
              jurisdiction of the courts in the designated operational city of
              the platform.
            </Clause>

            <Clause id="clause-18" num="18" title="Account Responsibility">
              Users are responsible for maintaining the confidentiality of their
              account credentials and for all activities conducted through their
              account.
            </Clause>

            <Clause id="clause-19" num="19" title="Prohibited Activities">
              Users agree not to misuse the platform, engage in unlawful
              activities, misrepresent information, or attempt to bypass platform
              processes.
            </Clause>

            <Clause id="clause-20" num="20" title="Platform Suspension Rights">
              The platform reserves the right to suspend or terminate user
              accounts in case of violation of these Terms or suspected misuse
              of the platform.
            </Clause>

            <Clause id="clause-21" num="21" title="Ratings and Reviews">
              Users may provide ratings or feedback regarding services. The
              platform reserves the right to moderate or remove inappropriate
              content.
            </Clause>

            <Clause id="clause-22" num="22" title="Service Availability">
              The platform does not guarantee uninterrupted or continuous
              availability of the service.
            </Clause>

            <Clause id="clause-23" num="23" title="Data and Privacy">
              User data may be collected and processed in accordance with the
              platform's Privacy Policy and applicable data protection laws.
            </Clause>

            <Clause id="clause-24" num="24" title="Modification of Terms">
              The platform reserves the right to update or modify these Terms at
              any time. Continued use of the platform constitutes acceptance of
              the revised Terms.
            </Clause>

            <Clause id="clause-25" num="25" title="Force Majeure">
              The platform shall not be liable for failure to perform obligations
              due to events beyond its reasonable control, including natural
              disasters, government actions, or technical failures.
            </Clause>

            <Clause id="clause-26" num="26" title="Entire Agreement">
              These Terms constitute the entire agreement between the platform
              and the user regarding use of the services.
            </Clause>

            <Clause id="clause-27" num="27" title="Severability">
              If any provision of these Terms is found to be invalid or
              unenforceable, the remaining provisions shall remain in full force
              and effect.
            </Clause>

            <Clause id="clause-28" num="28" title="Arbitration Agreement">
              In the event of any dispute, controversy, or claim arising out of
              or relating to the use of the platform or services arranged through
              the platform, the parties agree to first attempt to resolve the
              dispute amicably. If the dispute cannot be resolved through mutual
              discussion, it shall be referred to binding arbitration in
              accordance with the Arbitration and Conciliation Act, 1996. The
              arbitration proceedings shall take place in the jurisdiction
              specified by the platform.
            </Clause>

            <Clause id="clause-29" num="29" title="Class Action Waiver">
              Users agree that any dispute resolution proceedings shall be
              conducted only on an individual basis and not as part of any class
              action, collective action, or representative proceeding.
            </Clause>

            <Clause id="clause-30" num="30" title="Chargeback and Payment Dispute Protection">
              Users agree not to initiate unjustified chargebacks or payment
              reversals through banks or payment providers for services
              legitimately booked through the platform. In the event of such
              disputes, the platform reserves the right to suspend or restrict
              the user account until the matter is resolved.
            </Clause>

            <Clause id="clause-31" num="31" title="Background Check Disclaimer">
              While the platform may perform limited document verification or
              background checks on providers, such checks are conducted on a
              best-effort basis and should not be interpreted as a guarantee of
              safety, reliability, or suitability of the provider.
            </Clause>

            <Clause id="clause-32" num="32" title="Safety Incident Reporting">
              Users agree to promptly report any safety-related incidents,
              misconduct, or suspicious behavior through the platform's reporting
              system. The platform may review and take appropriate action
              including suspension of accounts but shall not be responsible for
              incidents occurring outside its operational control.
            </Clause>

            <Clause id="clause-33" num="33" title="Prohibition of Illegal or Improper Use of Security Services">
              Clients agree not to use the platform or engage security providers
              for any unlawful, harmful, or unethical activities. This includes
              but is not limited to intimidation, harassment, coercion, unlawful
              detention, violence, illegal weapon use, or any activity that
              violates applicable laws. The platform reserves the right to
              suspend or terminate accounts and report suspicious or illegal
              activity to relevant authorities if such misuse is suspected.
            </Clause>

            <Clause id="clause-34" num="34" title="Platform Neutrality and Non-Control Clause">
              The platform functions solely as a neutral technology intermediary
              that facilitates connections between clients and independent
              security service providers. The platform does not direct,
              supervise, manage, or control the conduct, actions, schedules, or
              methods of service delivery by any provider listed on the platform.
              All services are provided independently by the respective security
              providers, who retain full responsibility for their personnel,
              operations, and performance of services. Accordingly, the platform
              shall not be considered an employer, contractor, agent, or
              representative of any listed security provider.
            </Clause>

            <Clause id="clause-35" num="35" title="No Employer or Agency Relationship Clause">
              Nothing in these Terms shall be deemed to create any
              employer-employee, partnership, joint venture, or agency
              relationship between the platform and any security service provider
              listed on the platform. All providers operate as independent
              contractors or independent agencies and are solely responsible for
              hiring, managing, compensating, and supervising their personnel.
              The platform does not employ, appoint, or control any security
              personnel and shall not be liable for any employment-related
              claims, wages, benefits, or disputes between providers and their
              staff.
            </Clause>

            <Clause id="clause-36" num="36" title="Off-Platform Engagement and Circumvention Prohibition">
              Users agree not to circumvent, avoid, bypass, or undermine the
              platform by directly engaging, hiring, or contracting with any
              security service provider discovered through the platform outside
              of the platform's booking and payment system. Any attempt to
              conduct transactions or continue service engagements outside the
              platform that originated through the platform may result in account
              suspension, termination, or additional service fees as determined
              by the platform. The platform reserves the right to take
              appropriate action if it determines that users have attempted to
              bypass platform processes for the purpose of avoiding platform fees
              or policies.
            </Clause>

            <Clause id="clause-37" num="37" title="Liability Disclaimer for Gate Security and Property Guard Services">
              In the event of theft, burglary, loss of material, loss of assets,
              damage to property, or loss of life occurring at premises where a
              gate security guard or property guard service has been arranged
              through the platform, the platform shall bear no liability
              whatsoever. The platform acts solely as a technology connector and
              aggregator between clients and independent security service
              providers. The security provider and their deployed personnel are
              solely responsible for the discharge of their duties. The client
              acknowledges that the platform does not supervise, direct, or
              control the on-ground activities of any security personnel and
              cannot guarantee the prevention of theft, loss, damage, or any
              other incident. All disputes arising from such incidents shall be
              addressed directly between the client and the security provider.
            </Clause>

            <Clause id="clause-38" num="38" title="Grievance Redressal Mechanism (IT Act 2000 / Intermediary Guidelines Rule 4)">
              In compliance with the Information Technology Act 2000 and the
              Information Technology (Intermediary Guidelines and Digital Media
              Ethics Code) Rules 2021, the platform has appointed a Grievance
              Officer to address complaints and grievances of users.
              <div className={styles.contactCard}>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Grievance Officer</span>
                  <span className={styles.contactValue}>
                    20fourr Grievance Redressal Officer
                  </span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Email</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:grievance@20fourr.com">
                      grievance@20fourr.com
                    </a>
                  </span>
                </div>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Availability</span>
                  <span className={styles.contactValue}>
                    Monday to Friday, 10:00 AM – 6:00 PM IST
                  </span>
                </div>
              </div>
              <br />
              The Grievance Officer shall acknowledge receipt of any complaint
              within 24 hours and resolve or dispose of the complaint within 15
              calendar days of receipt. Users may file a formal grievance by
              selecting the "Formal Grievance" category when creating a support
              ticket in the app, or by emailing grievance@20fourr.com directly.
              If the grievance is not resolved within the specified period, users
              may escalate to the adjudicating officer appointed under the IT Act
              or to relevant regulatory authorities.
              <div className={styles.contactCard} style={{ marginTop: "var(--space-4)" }}>
                <div className={styles.contactRow}>
                  <span className={styles.contactLabel}>Data Protection Officer</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:dpo@20fourr.com">dpo@20fourr.com</a>
                  </span>
                </div>
              </div>
              <br />
              The Data Protection Officer may be contacted for matters relating
              to personal data processing, consent withdrawal, data export
              requests, or erasure requests under the Digital Personal Data
              Protection Act 2023.
            </Clause>
          </div>

          {/* ── PART 2 ── */}
          <div id="privacy" className={styles.part}>
            <div className={styles.partLine} />
            <span className={styles.partLabel}>Part 2</span>
            <div className={styles.partLine} />
          </div>
          <h2 className={styles.partTitle}>20fourr Privacy Policy</h2>

          <div className={styles.clauses}>
            <Clause id="clause-p1" num="01" title="Information We Collect">
              The Platform collects the following information:
              <ul className={styles.clauseList}>
                <li>
                  <strong>Identity Information:</strong> Name, date of birth,
                  government-issued ID numbers, passport information
                </li>
                <li>
                  <strong>Contact Information:</strong> Email address, phone
                  number, residential address, business address
                </li>
                <li>
                  <strong>Payment Information:</strong> Credit card data
                  (processed by third-party payment processor), transaction
                  history
                </li>
                <li>
                  <strong>Location Information:</strong> GPS location data
                  during active bookings, pickup and delivery addresses
                </li>
                <li>
                  <strong>Document Information:</strong> Copies of government
                  IDs, licenses, certifications, medical records, background
                  check results
                </li>
                <li>
                  <strong>Behavioral Information:</strong> Browsing history,
                  search queries, booking patterns, ratings and reviews
                </li>
                <li>
                  <strong>Communication Information:</strong> Messages between
                  users, support tickets, call logs
                </li>
                <li>
                  <strong>Threat Assessment Information:</strong> Descriptions
                  of threats, security concerns, and personal security needs
                </li>
                <li>
                  <strong>Biometric Information:</strong> Selfies submitted for
                  identity verification purposes
                </li>
                <li>
                  <strong>Device Information:</strong> Device type, operating
                  system, IP address, mobile identifiers
                </li>
              </ul>
            </Clause>

            <Clause id="clause-p2" num="02" title="How We Use Information">
              <ul className={styles.clauseList}>
                <li>To facilitate connections between Clients and Providers</li>
                <li>To verify user identity and qualification</li>
                <li>To process payments and track earnings</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To detect and prevent fraud and illegal activity</li>
                <li>
                  To communicate with users regarding bookings and services
                </li>
                <li>To provide customer support and resolve disputes</li>
                <li>
                  To improve Platform functionality and user experience
                </li>
                <li>
                  To send marketing communications (with user consent)
                </li>
                <li>To conduct analytics and research</li>
                <li>To monitor compliance with these Terms</li>
              </ul>
            </Clause>

            <Clause id="clause-p3" num="03" title="Information Sharing">
              Information is shared with:
              <ul className={styles.clauseList}>
                <li>
                  Service providers who assist in Platform operation (payment
                  processors, verification services, cloud providers)
                </li>
                <li>
                  Providers with Clients who have completed payment
                </li>
                <li>
                  Law enforcement when legally required or suspected of illegal
                  activity
                </li>
                <li>
                  Insurance companies when relevant to claim disputes
                </li>
                <li>
                  Other users of the Platform as necessary to facilitate
                  Services
                </li>
                <li>The Platform's corporate affiliates and subsidiaries</li>
              </ul>
            </Clause>

            <Clause id="clause-p4" num="04" title="Data Retention">
              Data is retained as follows, in compliance with applicable Indian
              law:
              <ul className={styles.clauseList}>
                <li>
                  KYC and identity documents (Aadhaar reference, police
                  verification, employment records): minimum 5 years from date
                  of upload (KYC §58).
                </li>
                <li>
                  Financial records (invoices, payments, transaction history):
                  minimum 6 years from date of transaction per Income Tax Act
                  requirements.
                </li>
                <li>
                  General account data: retained for the duration of the account
                  and up to 2 years after closure, unless a longer retention
                  period applies.
                </li>
              </ul>
              Users may request deletion of their data via the Privacy &amp;
              Data Rights section of the app. Deletion is subject to applicable
              legal retention obligations.
            </Clause>

            <Clause id="clause-p5" num="05" title="Data Security">
              The Platform uses industry-standard security measures including
              encryption, secure servers, and access controls. However, no
              security system is completely secure. Users are responsible for
              maintaining password confidentiality.
              <br />
              <br />
              By continuing to use the Platform, you consent to the collection,
              use, and sharing of information as described in this Privacy
              Policy.
            </Clause>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Questions about this agreement?{" "}
          <a href="mailto:grievance@20fourr.com">Email grievance@20fourr.com</a>
        </p>
      </footer>
    </div>
  );
}

/* ─── Clause component ───────────────────────────────────────────────── */

function Clause({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={styles.clause}>
      <span className={styles.clauseNum}>{num}</span>
      <div className={styles.clauseBody}>
        <p className={styles.clauseTitle}>{title}</p>
        <div className={styles.clauseText}>{children}</div>
      </div>
    </div>
  );
}
