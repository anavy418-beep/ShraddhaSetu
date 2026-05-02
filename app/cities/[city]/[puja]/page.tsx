import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServiceBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = {
  city: string;
  puja: string;
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, puja } = await params;
  const [cityRecord, service] = await Promise.all([
    prisma.city.findUnique({ where: { slug: city } }),
    getServiceBySlug(puja)
  ]);

  if (!cityRecord || !cityRecord.isActive || !service) {
    return {
      title: "Not Found | ShraddhaSetu"
    };
  }

  return {
    title: `${service.title} in ${cityRecord.name} | Book Online Puja Service`,
    description: `Book ${service.title} in ${cityRecord.name} with experienced pandits for authentic rituals and easy online booking.`
  };
}

export default async function CityPujaPage({ params }: PageProps) {
  const { city, puja: pujaSlug } = await params;
  const [cityRecord, puja] = await Promise.all([
    prisma.city.findUnique({ where: { slug: city } }),
    getServiceBySlug(pujaSlug)
  ]);

  if (!cityRecord || !cityRecord.isActive || !puja) {
    notFound();
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>
            {puja.title} in {cityRecord.name}
          </h1>
          <p>Book verified pandits for {puja.title.toLowerCase()} in {cityRecord.name}.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <img src={puja.image} alt={puja.title} style={{ width: "100%", maxHeight: 320, objectFit: "cover" }} />
            <div className="card-body">
              <p>{puja.longDescription}</p>
              <p>
                <strong>Price starts from:</strong> Rs {puja.priceFrom.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Duration:</strong> {puja.duration}
              </p>
              <p>
                <strong>Description:</strong> {puja.description}
              </p>
              <div className="row" style={{ marginTop: 12 }}>
                <Link className="btn btn-primary" href={`/services/${puja.slug}`}>
                  View Service
                </Link>
                <Link className="btn btn-outline" href={`/cities/${cityRecord.slug}`}>
                  Back to {cityRecord.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
