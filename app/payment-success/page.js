import Link from "next/link";

export const metadata = {
  title: "Payment Success | ShraddhaSetu"
};

export default async function PaymentSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.orderId || null;

  return (
    <section className="section">
      <div className="container">
        <div className="card">
          <div className="card-body">
            <h1>Payment Successful</h1>
            <p>Your payment has been completed successfully.</p>
            {orderId && (
              <p>
                <strong>Order ID:</strong> {orderId}
              </p>
            )}
            <div className="row">
              <Link href="/user-dashboard" className="btn btn-primary">
                Go to Dashboard
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
