import { ChatPage } from "@/components/chat/ChatPage";

export default async function BookingChatRoute(props: PageProps<"/bookings/[bookingId]/chat">) {
  const { bookingId } = await props.params;
  return <ChatPage bookingId={bookingId} />;
}
