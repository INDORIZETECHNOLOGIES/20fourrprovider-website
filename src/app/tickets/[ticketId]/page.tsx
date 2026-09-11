import { TicketDetailPage } from "@/components/tickets/TicketDetailPage";

export default async function TicketRoute(props: PageProps<"/tickets/[ticketId]">) {
  const { ticketId } = await props.params;
  return <TicketDetailPage ticketId={ticketId} />;
}
