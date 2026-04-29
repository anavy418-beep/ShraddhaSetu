import Link from "next/link";
import { getServices } from "@/lib/queries";

export const metadata = {
  title: "E-Puja | ShraddhaSetu"
};

export default async function EPujaPage() {
  const pujas = await getServices();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>E-Puja Booking</h1>
          <p>Book online puja with live video participation and prasad delivery options.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <div className="placeholder-video">Live Video / Streaming Window Placeholder</div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 18 }}>
            <div className="card-body">
              <h2 style={{ marginTop: 0 }}>Book E-Puja Slot</h2>
              <div className="form-grid">
                <select>
                  {pujas.map((puja) => (
                    <option key={puja.slug}>{puja.title}</option>
                  ))}
                </select>
                <input type="date" />
                <input type="time" />
                <input type="text" placeholder="Gotra" />
                <input type="text" placeholder="Devotee Name(s)" />
                <select>
                  <option>Prasad Delivery Required</option>
                  <option>Self Collection / Not Required</option>
                </select>
                <input type="file" />
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <Link href="/booking" className="btn btn-primary">
                  Continue to Booking
                </Link>
                <Link href="/user-dashboard" className="btn btn-outline">
                  Save Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
