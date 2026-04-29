export default function TestimonialCard({ review }) {
  return (
    <article className="card">
      <div className="card-body">
        <h3 style={{ marginTop: 0 }}>{review.customer}</h3>
        <p style={{ margin: "4px 0 10px", color: "#b45309" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
        <p style={{ color: "#6f5b4d" }}>{review.text}</p>
      </div>
    </article>
  );
}
