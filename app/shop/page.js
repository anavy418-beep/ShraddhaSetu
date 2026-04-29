import ProductGrid from "@/components/shop/ProductGrid";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop | ShraddhaSetu"
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Puja Samagri Shop</h1>
          <p>Order curated kits and ritual essentials delivered to your doorstep.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {!products.length && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-body">Shop is being updated. Products will be available shortly.</div>
            </div>
          )}
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
