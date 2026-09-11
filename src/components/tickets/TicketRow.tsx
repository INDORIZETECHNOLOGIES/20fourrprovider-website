import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { TICKET_STATUS_LABELS, TICKET_STATUS_TONE, TICKET_TYPE_LABELS } from "@/lib/constants/ticket";
import type { Ticket } from "@/lib/api/tickets";
import styles from "./TicketRow.module.css";

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket._id}`} className={styles.row}>
      <div className={styles.top}>
        <span className={styles.subject}>{ticket.subject}</span>
        <Badge tone={TICKET_STATUS_TONE[ticket.status]}>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
      </div>
      <span className={styles.meta}>
        {TICKET_TYPE_LABELS[ticket.type]} · {formatDate(ticket.createdAt)}
      </span>
    </Link>
  );
}
