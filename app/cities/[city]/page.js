import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { city } = await params;
  const cityRecord = await prisma.city.findUnique({ where: { slug: city } });
  if (!cityRecord) {
    return {
      title: "City Not Found | ShraddhaSetu"
    };
  }
  return {
    title: `Book Pandit in ${cityRecord.name} | ShraddhaSetu`,
    description: `Book verified pandits online in ${cityRecord.name} for puja, havan and sanskar rituals.`
  };
}

export default async function CityDetailPage({ params }) {
  const { city } = await params;
  const [cityRecord, services] = await Promise.all([
    prisma.city.findUnique({ where: { slug: city } }),
    getServices()
  ]);

  if (!cityRecord) {
    notFound();
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Book a Pandit in {cityRecord.name}</h1>
          <p>Available puja services in {cityRecord.name} with verified and experienced pandits.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card-grid">
            {services.map((puja) => (
              <article key={puja.slug} className="card">
                <img src={puja.image} alt={puja.title} style={{ width: "100%", height: 170, objectFit: "cover" }} />
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>{puja.title}</h3>
                  <p style={{ color: "#6f5b4d" }}>{puja.description}</p>
                  <div className="row">
                    <Link className="btn btn-outline" href={`/cities/${cityRecord.slug}/${puja.slug}`}>
                      View in {cityRecord.name}
                    </Link>
                    <Link className="btn btn-primary" href={`/booking?puja=${puja.slug}&city=${cityRecord.slug}`}>
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
