import Link from "next/link";
import EPujaProcessSteps from "@/components/EPujaProcessSteps";

export const metadata = {
  title: "E-Puja | ShraddhaSetu"
};

const howItWorksSteps = [
  {
    title: "Select Puja",
    description: "Choose your preferred online puja service and package based on your spiritual requirement."
  },
  {
    title: "Share Sankalp Details",
    description: "Submit devotee name, gotra, purpose, preferred date/time and contact details for proper sankalp."
  },
  {
    title: "Join Live Puja",
    description: "Join the scheduled puja through live video support and participate from your home with family."
  },
  {
    title: "Receive Prasad / Confirmation",
    description: "Receive puja completion confirmation and prasad delivery support as per selected package."
  }
];

const packages = [
  {
    key: "basic",
    title: "Basic E-Puja",
    price: "Rs 499",
    features: ["Online sankalp", "Digital confirmation", "Suitable for simple puja"],
    href: "/booking?mode=e-puja&package=basic",
    ctaLabel: "Book Basic E-Puja"
  },
  {
    key: "standard",
    title: "Standard E-Puja",
    price: "Rs 999",
    features: ["Live video puja", "Sankalp by pandit", "WhatsApp coordination"],
    href: "/booking?mode=e-puja&package=standard",
    recommended: true,
    ctaLabel: "Book Standard E-Puja"
  },
  {
    key: "premium",
    title: "Premium E-Puja",
    price: "Rs 1499",
    features: ["Live video puja", "Sankalp by pandit", "Prasad delivery support", "Priority scheduling"],
    href: "/booking?mode=e-puja&package=premium",
    ctaLabel: "Book Premium E-Puja"
  }
];

const onlinePujas = [
  "Satyanarayan Puja",
  "Rudrabhishek Puja",
  "Lakshmi Puja",
  "Ganesh Puja",
  "Navgraha Shanti",
  "Mahamrityunjaya Jaap",
  "Pitru Dosh Puja",
  "Kaal Sarp Dosh Puja",
  "Durga Puja",
  "Griha Pravesh Puja"
];

const sankalpDetails = [
  "Devotee name",
  "Gotra",
  "Purpose of puja",
  "Preferred date/time",
  "WhatsApp number",
  "Prasad delivery address if needed"
];

const faqItems = [
  {
    q: "Is E-Puja real?",
    a: "Yes. E-Puja is conducted by verified pandits with proper sankalp vidhi and live participation support."
  },
  {
    q: "How do I join the puja?",
    a: "After booking confirmation, you receive the scheduled time and live joining details on your contact number or WhatsApp."
  },
  {
    q: "Can I get prasad?",
    a: "Yes, prasad delivery support is available based on package, city coverage and service selection."
  },
  {
    q: "Can I choose date and time?",
    a: "Yes, you can share your preferred muhurat window and date while booking. Final slot is confirmed based on pandit availability."
  },
  {
    q: "Will I receive confirmation?",
    a: "Yes, booking confirmation is shared through phone, email or WhatsApp once the request is reviewed."
  }
];

export default function EPujaPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Online E-Puja with Live Sankalp</h1>
          <p>Join sacred pujas from your home with verified pandits, live video support and optional prasad delivery.</p>
          <div className="row" style={{ marginTop: 14 }}>
            <Link href="/booking?mode=e-puja" className="btn btn-primary">
              Book E-Puja
            </Link>
            <Link href="/services" className="btn btn-outline">
              View Puja Services
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How E-Puja Works</h2>
          <div className="card-grid">
            {howItWorksSteps.map((step, index) => (
              <article className="card" key={step.title}>
                <div className="card-body">
                  <span className="step-pill">{index + 1}</span>
                  <h3 style={{ margin: "12px 0 8px" }}>{step.title}</h3>
                  <p style={{ margin: 0, color: "#6f5b4d" }}>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">Complete E-Puja Booking Process</h2>
          <div className="card">
            <div className="card-body">
              <EPujaProcessSteps />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="e-puja-packages">
        <div className="container">
          <h2 className="section-title">E-Puja Packages</h2>
          <div className="card-grid">
            {packages.map((item) => (
              <article className={`card epuja-package-card ${item.recommended ? "recommended" : ""}`} key={item.key}>
                <div className="card-body">
                  {item.recommended ? <span className="epuja-badge">Recommended</span> : null}
                  <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                  <p className="epuja-price">{item.price}</p>
                  <ul className="epuja-list">
                    {item.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link href={item.href} className="btn btn-primary" style={{ marginTop: 10 }}>
                    {item.ctaLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">Available Online Puja Services</h2>
          <div className="card">
            <div className="card-body">
              <div className="row">
                {onlinePujas.map((puja) => (
                  <span className="chip" key={puja}>
                    {puja}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">Live Puja and Confirmation Support</h2>
          <div className="card-grid">
            <article className="card" id="e-puja-confirmation-info">
              <div className="card-body">
                <h3 style={{ marginTop: 0 }}>WhatsApp/Email Confirmation</h3>
                <p style={{ marginBottom: 0, color: "#6f5b4d" }}>
                  After booking submission and review, you receive confirmation updates on your registered phone, WhatsApp and
                  email.
                </p>
              </div>
            </article>
            <article className="card" id="live-puja-support">
              <div className="card-body">
                <h3 style={{ marginTop: 0 }}>Live Puja Support</h3>
                <p style={{ marginBottom: 0, color: "#6f5b4d" }}>
                  Before puja starts, our team shares live joining details and helps devotees connect smoothly for sankalp and
                  participation.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="prasad-delivery-info">
        <div className="container">
          <h2 className="section-title">Sankalp Details Required</h2>
          <div className="card">
            <div className="card-body">
              <p style={{ marginTop: 0, color: "#6f5b4d" }}>
                Please keep the following details ready while booking E-Puja to ensure smooth and proper sankalp.
              </p>
              <div className="card-grid">
                {sankalpDetails.map((detail) => (
                  <div className="epuja-detail-item" key={detail}>
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">E-Puja FAQ</h2>
          <div className="card-grid">
            {faqItems.map((item) => (
              <article className="card" key={item.q}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>{item.q}</h3>
                  <p style={{ marginBottom: 0, color: "#6f5b4d" }}>{item.a}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
