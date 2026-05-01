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
        <div className="row">
          <Link className="btn btn-outline" href={`/services/${puja.slug}`}>
            View Details
          </Link>
          <Link className="btn btn-primary" href={`/booking?puja=${puja.slug}`}>
            Book Now
          </Link>
          <Link className="btn btn-outline" href={`/cities/delhi/${puja.slug}`}>
            Book in Delhi
          </Link>
        </div>
      </div>
    </article>
  );
}
