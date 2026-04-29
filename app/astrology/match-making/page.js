import Link from "next/link";

export const metadata = {
  title: "Match Making | ShraddhaSetu"
};

export default function MatchMakingPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Match Making</h1>
          <p>Compare kundali details with simple form-based inputs.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <h2 style={{ marginTop: 0 }}>Person 1</h2>
              <div className="form-grid">
                <input type="text" placeholder="Name" />
                <input type="date" />
                <input type="time" />
                <input type="text" placeholder="Birth Place" />
              </div>
              <h2>Person 2</h2>
              <div className="form-grid">
                <input type="text" placeholder="Name" />
                <input type="date" />
                <input type="time" />
                <input type="text" placeholder="Birth Place" />
              </div>
              <Link className="btn btn-primary" style={{ marginTop: 14 }} href="/astrology/match-making?result=compatibility">
                Check Compatibility
              </Link>
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>Result Placeholder</h3>
                  <p>Guna score, dosha summary and compatibility notes will be shown here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
