import ServicesCatalog from "@/components/ServicesCatalog";
import { getServices, getUniqueServiceCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Puja Services | ShraddhaSetu"
};

export default async function ServicesPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const [services, categories] = await Promise.all([
    getServices({ search }),
    getUniqueServiceCategories()
  ]);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>All Puja Services</h1>
          <p>Choose rituals by category, language and purpose.</p>
        </div>
      </section>
      <ServicesCatalog search={search} services={services} categories={categories} />
    </>
  );
}
