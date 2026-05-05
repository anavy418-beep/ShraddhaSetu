import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import PujaCard from "@/components/PujaCard";
import TestimonialCard from "@/components/TestimonialCard";
import { getCities, getPublicReviews, getServices } from "@/lib/queries";

export const metadata = {
  title: "ShraddhaSetu | Book Verified Pandits for Pooja, Havan and Sanskar",
  description:
    "Book verified pandits online across India for griha pravesh, satyanarayan puja, rudrabhishek, marriage puja and more."
};

const popularPujas = [
  "Griha Pravesh",
  "Satyanarayan Puja",
  "Rudrabhishek",
  "Marriage Puja",
  "Kaal Sarp Dosh",
  "Pitru Dosh"
];

const faqItems = [
  {
    q: "How to book pandit?",
    a: "Select your puja, city, date and package, then confirm booking in 5 simple steps."
  },
  {
    q: "Are pandits verified?",
    a: "Yes, all listed pandits go through identity, experience and ritual authenticity checks."
  },
  {
    q: "Which cities are available?",
    a: "ShraddhaSetu currently serves major metro and spiritual cities across India."
  },
  {
    q: "What pujas can I book?",
    a: "You can book sanskar puja, dosha nivaran, havan, mukti karmas and special event rituals."
  },
  {
    q: "Online puja available or not?",
    a: "Yes, E-Puja is available with live streaming support and prasad delivery options."
  }
];

export default async function HomePage() {
  const [services, cities, reviews] = await Promise.all([getServices(), getCities(), getPublicReviews()]);

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <h1>ShraddhaSetu</h1>
          <p>Book Verified Pandits for Pooja, Havan and Sanskar</p>
          <HeroSearch popularPujas={popularPujas} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Popular Puja Services</h2>
          <p className="section-subtitle">Original, transparent and city-wise availability for every ritual.</p>
          <div className="card-grid">
            {services.slice(0, 6).map((puja) => (
              <PujaCard puja={puja} key={puja.id} />
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <Link href="/services" className="btn btn-outline">
              Explore All Services
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Book a Pandit Online in Your City</h2>
          <p className="section-subtitle">Book experienced Pandits for all pujas in top cities near you.</p>
          <div className="home-city-grid">
            {(Array.isArray(cities) ? cities : []).slice(0, 12).map((city) => (
              <Link key={city.id} href={`/cities/${city.slug}`} className="home-city-tile">
                <img
                  src={city.image}
                  alt={`${city.name} - ${city.templeName || "Temple"}`}
                  className="home-city-tile-image"
                />
                <div className="home-city-tile-overlay" />
                <h3 className="home-city-tile-title">{city.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stats">
            <div>
              <div className="stat-value">15,000+</div>
              <div>Bookings Completed</div>
            </div>
            <div>
              <div className="stat-value">1,200+</div>
              <div>Verified Pandits</div>
            </div>
            <div>
              <div className="stat-value">14+</div>
              <div>Active Cities</div>
            </div>
            <div>
              <div className="stat-value">4.8/5</div>
              <div>Average Rating</div>
            </div>
          </div>
          <p style={{ marginTop: 16, color: "#4d2d1a", fontWeight: 600 }}>Trusted by thousands of devotees</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Devotee Testimonials</h2>
          <div className="card-grid">
            {reviews.map((review) => (
              <TestimonialCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="card-grid">
            {faqItems.map((item) => (
              <article className="card" key={item.q}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>{item.q}</h3>
                  <p style={{ color: "#6f5b4d" }}>{item.a}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
