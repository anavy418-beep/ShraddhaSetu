import CheckoutPageClient from "@/components/shop/CheckoutPageClient";

export const metadata = {
  title: "Checkout | ShraddhaSetu"
};

export default function CheckoutPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Secure checkout placeholder for puja samagri orders.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <CheckoutPageClient />
        </div>
      </section>
    </>
  );
}
