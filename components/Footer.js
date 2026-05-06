import Link from "next/link";
import { getCities, getServices } from "@/lib/queries";

export default async function Footer() {
  const [cities, pujas] = await Promise.all([getCities(), getServices()]);
  const configuredPhone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_ADMIN_PHONE || "").replace(
    /\D/g,
    ""
  );
  const footerPhone = configuredPhone ? `+${configuredPhone}` : "Coming soon";

  return (
    <footer className="footer site-footer">
      <div className="container footer-grid">
        <section className="footer-column">
          <Link href="/" className="footer-brand" aria-label="Shraddha Setu">
            Shraddha Setu
          </Link>
          <p>
            Premium platform to book verified pandits for puja, havan, sanskar and online rituals with trusted
            support.
          </p>
        </section>
        <section className="footer-column">
          <h4>Quick Links</h4>
          <Link href="/">Home</Link>
          <Link href="/services">All Puja Services</Link>
          <Link href="/booking">Book Now</Link>
          <Link href="/e-puja">E-Puja</Link>
        </section>
        <section className="footer-column">
          <h4>Puja Services</h4>
          {pujas.slice(0, 5).map((puja) => (
            <Link href={`/services/${puja.slug}`} key={puja.slug}>
              {puja.title}
            </Link>
          ))}
        </section>
        <section className="footer-column">
          <h4>Cities</h4>
          {cities.slice(0, 6).map((city) => (
            <Link key={city.id} href={`/cities/${city.slug}`}>
              {city.name}
            </Link>
          ))}
        </section>
        <section className="footer-column">
          <h4>Blog & Policies</h4>
          <Link href="/blog">Festive Puja Guide</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/terms">Terms</Link>
        </section>
        <section className="footer-column footer-contact">
          <h4>Contact</h4>
          <p>Phone: {footerPhone}</p>
          <p>Email: support@shraddhasetu.in</p>
          <p>Hours: 7:00 AM - 10:00 PM IST</p>
        </section>
      </div>
      <div className="container" style={{ marginTop: 22 }}>
        <p style={{ margin: 0 }}>Copyright {new Date().getFullYear()} ShraddhaSetu. All rights reserved.</p>
        <div style={{ marginTop: 8, borderTop: "1px solid #4a3426" }} />
        <p style={{ margin: "8px 0 0", color: "#ffe5bd", fontSize: "0.95rem", textAlign: "center" }}>
          Powered by <span style={{ color: "#ffcf78", fontWeight: 700 }}>Malachite Technologies</span>
        </p>
      </div>
    </footer>
  );
}

