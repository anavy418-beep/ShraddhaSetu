import CityCard from "@/components/CityCard";
import { getCities } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cities | ShraddhaSetu"
};

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Book a Pandit Online in Your City</h1>
          <p>Choose your city and explore available puja services.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {!cities.length && (
            <div className="card">
              <div className="card-body">No cities are available at the moment. Please check again soon.</div>
            </div>
          )}
          <div className="card-grid">
            {cities.map((city) => (
              <CityCard key={city.id} city={city.name} slug={city.slug} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
