import Link from "next/link";
import { getApprovedPandits } from "@/lib/queries";

export const metadata = {
  title: "Verified Pandits | ShraddhaSetu"
};

export default async function PanditsPage() {
  const pandits = await getApprovedPandits();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Verified Pandit Profiles</h1>
          <p>Experienced pandits with language and specialization details.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card-grid">
            {pandits.map((pandit) => (
              <article key={pandit.id} className="card">
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>{pandit.name}</h3>
                  <p>Experience: {pandit.experience}+ years</p>
                  <p>City: {pandit.city}</p>
                  <p>Language: {pandit.languages.join(", ")}</p>
                  <p>Specialization: {pandit.specialization.join(", ")}</p>
                  <p>Rating: {pandit.rating} / 5</p>
                  <p>
                    Plan: {pandit.subscriptionPlan} ({pandit.subscriptionStatus})
                  </p>
                  <span className="tag">Verified</span>
                  {pandit.subscriptionPlan === "FEATURED" && pandit.subscriptionStatus === "active" && (
                    <span className="tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                      Featured Pandit
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link className="btn btn-primary" href="/pandit-register">
              Pandit Registration
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
