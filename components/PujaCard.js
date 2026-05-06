import Link from "next/link";

export default function PujaCard({ puja }) {
  return (
    <article className="card">
      <img src={puja.image} alt={puja.title} style={{ width: "100%", height: 170, objectFit: "cover" }} />
      <div className="card-body">
        <p className="tag">{puja.category}</p>
        <h3 style={{ marginTop: 0 }}>{puja.title}</h3>
        <p style={{ color: "#6f5b4d" }}>{puja.description}</p>
        <p>
          <strong>Starts from:</strong> Rs {puja.priceFrom.toLocaleString("en-IN")}
        </p>
        <p>
          <strong>Duration:</strong> {puja.duration}
        </p>
        <p>
          <strong>Language:</strong> {puja.language.join(", ")}
        </p>
        <div className="puja-card-actions">
          <Link className="puja-card-details-btn" href={`/services/${puja.slug}`}>
            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 10v6M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>View Details</span>
          </Link>
          <Link className="puja-card-book-btn" href={`/booking?puja=${puja.slug}`}>
            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Book Now</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
