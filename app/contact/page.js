import Link from "next/link";

export const metadata = {
  title: "Contact Us | ShraddhaSetu"
};

export default function ContactPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Reach our support team for bookings, reschedules, and guidance.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <div className="form-grid">
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email" />
                <input type="tel" placeholder="Phone" />
                <textarea rows={5} placeholder="Message" />
              </div>
              <Link className="btn btn-primary" style={{ marginTop: 12 }} href="/contact?sent=1">
                Send Message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
