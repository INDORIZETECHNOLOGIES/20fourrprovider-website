import { Badge } from "@/components/ui/Badge";
import { formatPaise, formatDate } from "@/lib/format";
import { SETTLEMENT_STATE_LABELS, SETTLEMENT_STATE_TONE } from "@/lib/constants/settlementState";
import type { Settlement } from "@/lib/api/settlements";
import styles from "./SettlementRow.module.css";

export function SettlementRow({ settlement }: { settlement: Settlement }) {
  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <span className={styles.reference}>{settlement.bookingReference}</span>
        <Badge tone={SETTLEMENT_STATE_TONE[settlement.state]}>
          {SETTLEMENT_STATE_LABELS[settlement.state]}
        </Badge>
      </div>
      <div className={styles.breakdown}>
        {settlement.grossPaise !== null ? <span>Gross {formatPaise(settlement.grossPaise)}</span> : null}
        {settlement.tdsPaise > 0 ? <span>TDS -{formatPaise(settlement.tdsPaise)}</span> : null}
        {settlement.tcsPaise > 0 ? <span>TCS -{formatPaise(settlement.tcsPaise)}</span> : null}
      </div>
      {settlement.netPaise !== null ? (
        <p className={styles.net}>Net payout {formatPaise(settlement.netPaise)}</p>
      ) : null}
      <p className={styles.footer}>
        {settlement.releasedAt
          ? `Released ${formatDate(settlement.releasedAt)}${settlement.utr ? ` · UTR ${settlement.utr}` : ""}`
          : settlement.releaseScheduledFor
            ? `Expected around ${formatDate(settlement.releaseScheduledFor)}`
            : null}
      </p>
    </div>
  );
}
