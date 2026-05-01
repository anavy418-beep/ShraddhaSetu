import Link from "next/link";

export default function CityCard({ city, state, slug }) {
  const cityLabel = state ? `${city}, ${state}` : city;
  return (
    <article className="card">
      <div className="card-body">
        <h3 style={{ marginTop: 0 }}>{cityLabel}</h3>
        <p style={{ color: "#6f5b4d" }}>Book trusted pandits in {city} for puja, havan and sanskar rituals.</p>
        <Link className="btn btn-outline" href={`/cities/${slug || city.toLowerCase()}`}>
          View City
        </Link>
      </div>
    </article>
  );
}
