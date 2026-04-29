import CartPageClient from "@/components/shop/CartPageClient";

export const metadata = {
  title: "Cart | ShraddhaSetu"
};

export default function CartPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Cart</h1>
          <p>Review your selected puja samagri products.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <CartPageClient />
        </div>
      </section>
    </>
  );
}
