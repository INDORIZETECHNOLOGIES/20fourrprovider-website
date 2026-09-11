import { BookingDetailPage } from "@/components/bookings/BookingDetailPage";

export default async function BookingRoute(props: PageProps<"/bookings/[bookingId]">) {
  const { bookingId } = await props.params;
  return <BookingDetailPage bookingId={bookingId} />;
}
