import styles from "./Faq.module.css";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Does 20fourr take a cut of my rate?",
    a: "No. Your listed price is what the booking pays you. The platform fee is added to the client's bill on top of it. The only deductions from your payout are the taxes the law requires us to collect: TCS at 0.5%, and TDS at 0.1% where it applies.",
  },
  {
    q: "When is a booking paid out?",
    a: "Once duty has ended and you've uploaded your invoice for that booking, the payout is released to your bank account through Razorpay. Each booking is settled on its own, with a statement showing every deduction.",
  },
  {
    q: "How do clients find me?",
    a: "There's no job board to browse. Clients search a city and a service, and see verified providers who have priced that city and are available. Reliability decides the order: turning up, finishing jobs, responding quickly, then ratings.",
  },
  {
    q: "What if I run an agency with fifty people?",
    a: "Register as an agency. You keep a roster of your people with their documents, declare how many of each you can field per day, and clients book several people as one booking. You choose who goes.",
  },
  {
    q: "How long does verification take?",
    a: "It's a single review of the documents you upload. You can set up your rates, team and bank account in the meantime; accepting bookings waits for the review.",
  },
  {
    q: "What happens if a client cancels?",
    a: "The booking is cancelled and the client's refund follows the platform's cancellation rules. If you think a cancellation affected a payout you were owed, open a support ticket on that booking from the app.",
  },
  {
    q: "I only want to work some days. Is that fine?",
    a: "Yes. One switch pauses you completely, and you can block individual days. Nothing is booked without you accepting it.",
  },
  {
    q: "Who do I contact with a problem?",
    a: "Open a ticket from Support in the app for anything about a booking, payout or your account. For grievances, write to grievance@20fourr.com.",
  },
];

export function Faq() {
  return (
    <section id="faq" className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.inner}>
        <h2 id="faq-title" className={styles.title}>
          Questions providers ask first
        </h2>
        <div className={styles.list}>
          {FAQS.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.q}>
                {item.q}
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={styles.chevron}>
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className={styles.a}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
