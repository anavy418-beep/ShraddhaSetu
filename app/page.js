import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import PujaCard from "@/components/PujaCard";
import TestimonialCard from "@/components/TestimonialCard";
import FaqAccordion from "@/components/FaqAccordion";
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
    a: "You can book a pandit by selecting puja service, choosing your city, selecting date/time, filling devotee details, and confirming the booking. After booking, our team will contact you for final confirmation."
  },
  {
    q: "Are pandits verified?",
    a: "Yes, ShraddhaSetu lists verified pandits. Pandits are checked for identity, puja experience, ritual knowledge, and service reliability before being shown for booking."
  },
  {
    q: "Which cities are available?",
    a: "ShraddhaSetu currently serves 60+ cities across India including Delhi, Mumbai, Bangalore, Ahmedabad, Ayodhya, Varanasi, Jaipur, Lucknow, Pune, Hyderabad, Chennai, Kolkata, Surat, Indore, Bhopal, Dehradun, Haridwar, Rishikesh and more."
  },
  {
    q: "What pujas can I book?",
    a: "You can book popular pujas like Satyanarayan Puja, Griha Pravesh Puja, Rudrabhishek Puja, Marriage Puja, Pitru Dosh Puja, Kaal Sarp Dosh Puja, Lakshmi Puja, Ganesh Puja, Navgraha Shanti, Havan, Sanskar Puja and festival pujas."
  },
  {
    q: "Online puja available or not?",
    a: "Yes, E-Puja is available. Devotees can join puja online through live video support. Prasad delivery and sankalp details can also be managed based on the selected service."
  },
  {
    q: "Can I book puja for another city?",
    a: "Yes, you can book puja in any available city. Select the city, puja service, date and share required details during booking."
  },
  {
    q: "How will I get booking confirmation?",
    a: "After submitting the booking form, you will receive confirmation through phone, email or WhatsApp depending on available contact details. Admin can review and confirm the booking."
  },
  {
    q: "Is payment online available?",
    a: "Online payment support can be enabled through Razorpay. If payment is not active yet, booking can still be submitted and payment can be handled after confirmation."
  },
  {
    q: "Can I choose date and time for puja?",
    a: "Yes, you can choose preferred date and time during booking. Final timing may be confirmed based on pandit availability and muhurat."
  },
  {
    q: "What details are required for booking?",
    a: "Basic details like name, phone number, city, puja type, date/time, address, gotra if applicable, and special instructions may be required."
  }
];

export default async function HomePage() {
  const [services, cities, reviews] = await Promise.all([getServices(), getCities(), getPublicReviews()]);

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <h1 className="sr-only">Shraddha Setu</h1>
          <img
            src="/images/brand/shraddha-setu-3d-logo.png"
            alt="Shraddha Setu"
            className="hero-logo-image"
            loading="eager"
          />
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
            {(Array.isArray(cities) ? cities : []).map((city) => (
              <Link key={city.id} href={`/cities/${city.slug}`} className="home-city-tile">
                <img
                  src={city.image}
                  alt={`${city.name} - ${city.templeName || "Temple"}`}
                  className="home-city-tile-image"
                  loading="lazy"
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
              <div className="stat-value">60+</div>
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
          <FaqAccordion items={faqItems} />
        </div>
      </section>
    </>
  );
}
