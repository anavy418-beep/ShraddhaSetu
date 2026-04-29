import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Confirmation | ShraddhaSetu"
};

export default async function ConfirmationPage({ searchParams }) {
  const params = await searchParams;
  const bookingId = params?.bookingId || "";
  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { bookingId },
        include: { pujaService: true, city: true }
      })
    : null;

  return (
    <section className="section">
      <div className="container">
        <div className="card">
          <div className="card-body">
            <h1>Booking Confirmed</h1>
            <p>Your request has been successfully submitted to ShraddhaSetu.</p>
            {booking ? (
              <>
                <p>
                  <strong>Booking ID:</strong> {booking.bookingId}
                </p>
                <p>
                  <strong>Puja:</strong> {booking.pujaService.title}
                </p>
                <p>
                  <strong>City:</strong> {booking.city.name}
                </p>
                <p>
                  <strong>Date and Time:</strong> {booking.scheduledFor.toISOString().slice(0, 10)} |{" "}
                  {booking.scheduledFor.toISOString().slice(11, 16)}
                </p>
                <p>
                  <strong>Package:</strong> {booking.packageName}
                </p>
                <p>
                  <strong>Amount:</strong> Rs {booking.amount.toLocaleString("en-IN")}
                </p>
                <p>
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                </p>
              </>
            ) : (
              <p>Booking details are being prepared. Please check your dashboard shortly.</p>
            )}
            <div className="row" style={{ marginTop: 16 }}>
              <Link href="/user-dashboard" className="btn btn-primary">
                Go to My Bookings
              </Link>
              <Link href="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
