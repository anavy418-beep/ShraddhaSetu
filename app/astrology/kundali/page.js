import Link from "next/link";

export const metadata = {
  title: "Kundali | ShraddhaSetu"
};

export default function KundaliPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Kundali</h1>
          <p>Enter birth details to generate a basic kundali result placeholder.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <div className="form-grid">
                <input type="text" placeholder="Full Name" />
                <input type="date" placeholder="Date of Birth" />
                <input type="time" placeholder="Time of Birth" />
                <input type="text" placeholder="Place of Birth" />
              </div>
              <Link className="btn btn-primary" style={{ marginTop: 14 }} href="/astrology/kundali?result=basic">
                Generate Kundali
              </Link>
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>Result Placeholder</h3>
                  <p>
                    Your basic lagna, rashi and planetary overview will appear here. Integrate backend astrology APIs
                    later for live calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
