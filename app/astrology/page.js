import Link from "next/link";

export const metadata = {
  title: "Astrology Services | ShraddhaSetu"
};

export default function AstrologyPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Astrology</h1>
          <p>Explore kundali analysis, match making and personalized guidance.</p>
        </div>
      </section>
      <section className="section">
        <div className="container card-grid">
          <article className="card">
            <div className="card-body">
              <h2 style={{ marginTop: 0 }}>Kundali</h2>
              <p>Generate birth chart details with a clean, guided form.</p>
              <Link className="btn btn-primary" href="/astrology/kundali">
                Open Kundali
              </Link>
            </div>
          </article>
          <article className="card">
            <div className="card-body">
              <h2 style={{ marginTop: 0 }}>Match Making</h2>
              <p>Check compatibility score and essential marriage factors.</p>
              <Link className="btn btn-primary" href="/astrology/match-making">
                Open Match Making
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
