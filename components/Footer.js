import Link from "next/link";
import { getCities, getServices } from "@/lib/queries";

export default async function Footer() {
  const [cities, pujas] = await Promise.all([getCities(), getServices()]);

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <section>
          <h4>ShraddhaSetu</h4>
          <p>
            Premium platform to book verified pandits for puja, havan, sanskar and online rituals with trusted
            support.
          </p>
        </section>
        <section>
          <h4>Quick Links</h4>
          <Link href="/">Home</Link>
          <Link href="/services">All Puja Services</Link>
          <Link href="/e-puja">E-Puja</Link>
          <Link href="/panchang">Panchang</Link>
          <Link href="/shop">Shop</Link>
        </section>
        <section>
          <h4>Puja Services</h4>
          {pujas.slice(0, 5).map((puja) => (
            <Link href={`/services/${puja.slug}`} key={puja.slug}>
              {puja.title}
            </Link>
          ))}
        </section>
        <section>
          <h4>Cities</h4>
          {cities.slice(0, 6).map((city) => (
            <Link key={city.id} href={`/cities/${city.slug}`}>
              {city.name}
            </Link>
          ))}
        </section>
        <section>
          <h4>Blog & Policies</h4>
          <Link href="/blog">Festive Puja Guide</Link>
          <Link href="/blog/category/festivals">Festival Insights</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/terms">Terms</Link>
        </section>
        <section>
          <h4>Contact</h4>
          <p>Phone: +91 90000 12345</p>
          <p>Email: support@shraddhasetu.in</p>
          <p>Hours: 7:00 AM - 10:00 PM IST</p>
        </section>
      </div>
      <div className="container" style={{ marginTop: 22, borderTop: "1px solid #4a3426", paddingTop: 16 }}>
        Copyright {new Date().getFullYear()} ShraddhaSetu. All rights reserved.
      </div>
    </footer>
  );
}

