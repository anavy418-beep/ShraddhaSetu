import Link from "next/link";
import { notFound } from "next/navigation";
import { getPanditBySlug, getPandits } from "@/lib/pandits";

export async function generateMetadata({ params }) {
  const resolved = await params;
  const pandit = getPanditBySlug(resolved.slug);
  if (!pandit) {
    return { title: "Pandit Not Found | ShraddhaSetu" };
  }
  return {
    title: `${pandit.name} | Verified Pandit | ShraddhaSetu`,
    description: `${pandit.name} - ${pandit.experienceYears}+ years experience, ${pandit.city}. Book verified pandit online or face to face.`
  };
}

export function generateStaticParams() {
  return getPandits().map((pandit) => ({ slug: pandit.slug }));
}

export default async function PanditDetailPage({ params }) {
  const resolved = await params;
  const pandit = getPanditBySlug(resolved.slug);
  if (!pandit) {
    notFound();
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>{pandit.name}</h1>
          <p>Verified profile for puja, havan and sanskar rituals.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <article className="pandit-detail-card">
            <div className="pandit-detail-top">
              <img src={pandit.image} alt={pandit.name} className="pandit-detail-image" />
              <div>
                <h2>{pandit.name}</h2>
                <p className="pandit-detail-bio">{pandit.bio}</p>
                <div className="row" style={{ marginTop: 12 }}>
                  <a className="btn btn-outline" href={`tel:${pandit.callNumber}`}>
                    Call Now
                  </a>
                  <Link className="btn btn-primary" href={`/booking?pandit=${pandit.slug}`}>
                    Book This Pandit
                  </Link>
                  <Link className="btn btn-outline" href="/pandits">
                    Back to Pandits
                  </Link>
                </div>
              </div>
            </div>

            <div className="pandit-detail-stats">
              <div className="pandit-stat-item">
                <strong>{pandit.bookingsCount.toLocaleString("en-IN")}</strong>
                <span>Poojas Performed</span>
              </div>
              <div className="pandit-stat-item">
                <strong>{"★".repeat(Math.round(pandit.rating))}</strong>
                <span>{pandit.rating.toFixed(1)} Rating</span>
              </div>
            </div>

            <div className="pandit-availability-grid">
              <div className={`pandit-availability-card ${pandit.onlinePuja ? "active" : ""}`}>
                Available for Online Puja: <strong>{pandit.onlinePuja ? "Yes" : "No"}</strong>
              </div>
              <div className={`pandit-availability-card ${pandit.faceToFacePuja ? "active" : ""}`}>
                Available for Face to Face Puja: <strong>{pandit.faceToFacePuja ? "Yes" : "No"}</strong>
              </div>
            </div>

            <ul className="pandit-detail-list">
              <li>I speak {pandit.languages.join(", ")}</li>
              <li>I have {pandit.experienceYears}+ years of experience</li>
              <li>Gender: {pandit.gender}</li>
              <li>Age: {pandit.age}</li>
              <li>Hometown: {pandit.hometown}</li>
              <li>Current Address: {pandit.address}</li>
              <li>Temple Availability: {pandit.templeAvailability}</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
