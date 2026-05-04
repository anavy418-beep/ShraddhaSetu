import Link from "next/link";
import { CITY_CARD_FALLBACK_IMAGE } from "@/lib/cityCardData";

export default function CityCard({ city }) {
  const cityName = city?.name || "City";
  const state = city?.state || "";
  const cityLabel = state ? `${cityName}, ${state}` : cityName;
  const citySlug = city?.slug || cityName.toLowerCase();
  const cityImage = city?.image || CITY_CARD_FALLBACK_IMAGE;
  const popularPujas = Array.isArray(city?.popularPujas) && city.popularPujas.length ? city.popularPujas : ["Satyanarayan Puja", "Rudrabhishek Puja", "Griha Pravesh Puja"];
  const stats = city?.stats || {};
  const pujaConducted = stats?.pujaConducted ?? 0;
  const pandits = stats?.pandits ?? 0;

  return (
    <article className="card">
      <div style={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden", borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
        <img
          src={cityImage}
          alt={`${cityName} landmark`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(38,24,14,0.08) 28%, rgba(38,24,14,0.72) 100%)"
          }}
        />
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 8 }}>
          <h3 style={{ margin: 0, color: "#fff5e7", lineHeight: 1.2 }}>{cityName}</h3>
          {city?.isAvailable !== false && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.92)",
                color: "#1f5d32",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: "0.76rem",
                fontWeight: 700
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }} />
              Available
            </span>
          )}
        </div>
      </div>
      <div className="card-body">
        <p style={{ marginTop: 0, color: "#6f5b4d" }}>{cityLabel}</p>
        <p style={{ color: "#6f5b4d" }}>Book trusted pandits in {cityName} for puja, havan and sanskar rituals.</p>
        <div className="row" style={{ gap: 14, marginBottom: 10, color: "#5a4332", fontSize: "0.9rem" }}>
          <span>
            <strong>{pujaConducted}</strong> Puja Conducted
          </span>
          <span>
            <strong>{pandits}</strong> Pandits
          </span>
        </div>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          {popularPujas.slice(0, 3).map((puja) => (
            <span key={puja} className="chip">
              {puja}
            </span>
          ))}
        </div>
        <div className="row">
          <Link className="btn btn-outline" href={`/cities/${citySlug}`}>
            View City
          </Link>
          <Link className="btn btn-outline" href={`/cities/${citySlug}/griha-pravesh-puja`}>
            Popular Puja
          </Link>
        </div>
      </div>
    </article>
  );
}
