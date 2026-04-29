import Link from "next/link";

export const metadata = {
  title: "Payment Failed | ShraddhaSetu"
};

export default async function PaymentFailurePage({ searchParams }) {
  const params = await searchParams;
  const bookingId = params?.bookingId || "";

  return (
    <section className="section">
      <div className="container">
        <div className="card">
          <div className="card-body">
            <h1>Payment Failed</h1>
            <p>We could not complete your payment. Please try again.</p>
            {bookingId && (
              <p>
                <strong>Booking ID:</strong> {bookingId}
              </p>
            )}
            <div className="row">
              <Link href={bookingId ? `/booking?bookingId=${bookingId}` : "/checkout"} className="btn btn-primary">
                Retry Payment
              </Link>
              <Link href="/cart" className="btn btn-outline">
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
