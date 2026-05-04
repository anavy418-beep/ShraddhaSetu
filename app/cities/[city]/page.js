import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServices } from "@/lib/queries";
import { toCityCardData } from "@/lib/cityCardData";

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

export default async function CityDetailPage({ params, searchParams }) {
  const { city } = await params;
  const query = await searchParams;
  const [cityRecord, services] = await Promise.all([
    prisma.city.findUnique({ where: { slug: city } }),
    getServices()
  ]);

  if (!cityRecord) {
    notFound();
  }

  const cityData = toCityCardData(cityRecord);
  const heroImageFromQuery = typeof query?.image === "string" ? query.image : "";
  const safeHeroImage = heroImageFromQuery.startsWith("/images/cities/") ? heroImageFromQuery : cityData.image;
  const heroTempleName = typeof query?.temple === "string" ? query.temple : cityData.templeName;

  return (
    <>
      <section
        className="page-header"
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(180deg, rgba(28,16,10,0.18), rgba(28,16,10,0.62)), url('${safeHeroImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container">
          <h1 style={{ color: "#fff9ef", textShadow: "0 3px 16px rgba(30, 18, 10, 0.6)" }}>Book a Pandit in {cityRecord.name}</h1>
          <p style={{ color: "#fff3dd", maxWidth: 780 }}>
            Available puja services in {cityRecord.name} with verified and experienced pandits.
          </p>
          <p style={{ color: "#f5d59c", fontWeight: 600, marginBottom: 0 }}>{heroTempleName}</p>
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
