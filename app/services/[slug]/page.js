import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedPandits, getServiceBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const puja = await getServiceBySlug(slug);
  if (!puja) {
    return {
      title: "Service Not Found | ShraddhaSetu"
    };
  }
  return {
    title: `${puja.title} | ShraddhaSetu`,
    description: puja.description
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const puja = await getServiceBySlug(slug);

  if (!puja) {
    notFound();
  }

  const allPandits = await getApprovedPandits();
  const matchedPandits = allPandits.filter((item) =>
    item.specialization.some((spec) => puja.specialization.join(" ").toLowerCase().includes(spec.toLowerCase()))
  );

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>{puja.title}</h1>
          <p>{puja.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <img src={puja.image} alt={puja.title} style={{ width: "100%", maxHeight: 340, objectFit: "cover" }} />
            <div className="card-body">
              <p>{puja.longDescription}</p>
              <p>
                <strong>Price starts from:</strong> Rs {puja.priceFrom.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Duration:</strong> {puja.duration}
              </p>
              <p>
                <strong>Available Languages:</strong> {puja.language.join(", ")}
              </p>
              <div className="row">
                {puja.specialization.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="row" style={{ marginTop: 18 }}>
                <Link className="btn btn-outline" href="/services">
                  Back to Services
                </Link>
              </div>
            </div>
          </div>

          <h2 className="section-title" style={{ marginTop: 28 }}>
            Verified Pandits for this Puja
          </h2>
          <div className="card-grid">
            {matchedPandits.map((item) => (
              <article className="card" key={item.id}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>{item.name}</h3>
                  <p>{item.experience}+ years experience</p>
                  <p>City: {item.city}</p>
                  <p>Languages: {item.languages.join(", ")}</p>
                  <p>Rating: {item.rating} / 5</p>
                  <p>Plan: {item.subscriptionPlan}</p>
                  <span className="tag">Verified</span>
                  {item.subscriptionPlan === "FEATURED" && item.subscriptionStatus === "active" && (
                    <span className="tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                      Featured
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
