import { getCities } from "@/lib/queries";
import PanchangClient from "@/components/PanchangClient";

export const metadata = {
  title: "Daily Panchang | ShraddhaSetu"
};

export default async function PanchangPage() {
  const cities = await getCities();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Daily Panchang</h1>
          <p>Track essential Vedic calendar details for your selected city and date.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <PanchangClient cities={cities} />
        </div>
      </section>
    </>
  );
}
