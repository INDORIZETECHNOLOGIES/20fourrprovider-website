import { Badge } from "@/components/ui/Badge";
import { formatPaise, formatDate } from "@/lib/format";
import { SETTLEMENT_STATE_LABELS, SETTLEMENT_STATE_TONE } from "@/lib/constants/settlementState";
import type { Settlement } from "@/lib/api/settlements";
import styles from "./SettlementRow.module.css";

export function SettlementRow({ settlement }: { settlement: Settlement }) {
  const deductions = [
    settlement.grossPaise !== null ? `Gross ${formatPaise(settlement.grossPaise)}` : null,
    settlement.tdsPaise > 0 ? `TDS −${formatPaise(settlement.tdsPaise)}` : null,
    settlement.tcsPaise > 0 ? `TCS −${formatPaise(settlement.tcsPaise)}` : null,
  ].filter(Boolean);

  const timing = settlement.releasedAt
    ? `Released ${formatDate(settlement.releasedAt)}${settlement.utr ? ` · UTR ${settlement.utr}` : ""}`
    : settlement.releaseScheduledFor
      ? `Expected around ${formatDate(settlement.releaseScheduledFor)}`
      : null;

  return (
    <div className={styles.row}>
      <div className={styles.main}>
        <p className={styles.reference}>{settlement.bookingReference}</p>
        {timing ? <p className={styles.timing}>{timing}</p> : null}
        {deductions.length > 0 ? <p className={styles.breakdown}>{deductions.join(" · ")}</p> : null}
      </div>

      {/* Net is what actually reaches the bank, so it's the number that reads. */}
      <div className={styles.amountCol}>
        {settlement.netPaise !== null ? (
          <p className={styles.net}>{formatPaise(settlement.netPaise)}</p>
        ) : null}
        <Badge tone={SETTLEMENT_STATE_TONE[settlement.state]}>
          {SETTLEMENT_STATE_LABELS[settlement.state]}
        </Badge>
      </div>
    </div>
  );
}
