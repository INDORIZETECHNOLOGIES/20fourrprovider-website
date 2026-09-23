import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPaise, formatDate } from "@/lib/format";
import { settlementBadge } from "@/lib/constants/settlementState";
import type { Settlement } from "@/lib/api/settlements";
import styles from "./SettlementRow.module.css";

export function SettlementRow({ settlement }: { settlement: Settlement }) {
  const deductions = [
    settlement.grossPaise !== null ? `Gross ${formatPaise(settlement.grossPaise)}` : null,
    settlement.tdsPaise > 0 ? `TDS −${formatPaise(settlement.tdsPaise)}` : null,
    settlement.tcsPaise > 0 ? `TCS −${formatPaise(settlement.tcsPaise)}` : null,
  ].filter(Boolean);

  // Newer bookings have no scheduled date: the payout goes out once duty has ended and the
  // invoice is uploaded. `releaseScheduledFor` only exists on bookings from before that change.
  const timing = settlement.releasedAt
    ? `Released ${formatDate(settlement.releasedAt)}${settlement.utr ? ` · UTR ${settlement.utr}` : ""}`
    : settlement.releaseScheduledFor
      ? `Expected around ${formatDate(settlement.releaseScheduledFor)}`
      : null;
  const badge = settlementBadge(settlement.state, settlement.invoiceUploaded);

  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <p className={styles.reference}>{settlement.bookingReference}</p>
        {settlement.state === "calculated" && !settlement.invoiceUploaded ? (
          <p className={styles.timing}>
            <Link href={`/bookings/${settlement.bookingId}`}>Upload your invoice</Link> for this booking to get paid
          </p>
        ) : timing ? (
          <p className={styles.timing}>{timing}</p>
        ) : null}
        {deductions.length > 0 ? <p className={styles.breakdown}>{deductions.join(" · ")}</p> : null}
      </div>

      {/* Net is what actually reaches the bank, so it's the number that reads. */}
      <div className={styles.amountCol}>
        {settlement.netPaise !== null ? (
          <p className={styles.net}>{formatPaise(settlement.netPaise)}</p>
        ) : null}
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
    </div>
  );
}
