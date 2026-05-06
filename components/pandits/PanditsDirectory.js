"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { panditFilterOptions } from "@/lib/pandits";

const starText = (rating) => "★".repeat(Math.round(rating));

const initialFilters = {
  language: "",
  experience: "",
  city: "",
  pujaMode: ""
};

export default function PanditsDirectory({ pandits }) {
  const [filters, setFilters] = useState(initialFilters);

  const filteredPandits = useMemo(() => {
    return pandits.filter((pandit) => {
      if (filters.language && !pandit.languages.includes(filters.language)) {
        return false;
      }
      if (filters.experience && pandit.experienceYears < Number(filters.experience)) {
        return false;
      }
      if (filters.city && pandit.city !== filters.city) {
        return false;
      }
      if (filters.pujaMode === "online" && !pandit.onlinePuja) {
        return false;
      }
      if (filters.pujaMode === "offline" && !pandit.faceToFacePuja) {
        return false;
      }
      return true;
    });
  }, [filters, pandits]);

  return (
    <div className="pandits-layout">
      <aside className="pandits-filter-card">
        <div className="pandits-filter-head">
          <h3>Filters</h3>
          <button type="button" className="btn btn-outline" onClick={() => setFilters(initialFilters)}>
            Clear All
          </button>
        </div>

        <label className="pandits-filter-label">
          Language
          <select value={filters.language} onChange={(event) => setFilters((prev) => ({ ...prev, language: event.target.value }))}>
            <option value="">All Languages</option>
            {panditFilterOptions.languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <label className="pandits-filter-label">
          Experience
          <select value={filters.experience} onChange={(event) => setFilters((prev) => ({ ...prev, experience: event.target.value }))}>
            <option value="">Any Experience</option>
            {panditFilterOptions.experience.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pandits-filter-label">
          City
          <select value={filters.city} onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))}>
            <option value="">All Cities</option>
            {panditFilterOptions.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="pandits-filter-label">
          Puja Mode
          <select value={filters.pujaMode} onChange={(event) => setFilters((prev) => ({ ...prev, pujaMode: event.target.value }))}>
            <option value="">All Modes</option>
            {panditFilterOptions.pujaModes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </aside>

      <div className="pandits-card-list">
        {filteredPandits.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginTop: 0 }}>No pandits found</h3>
              <p>Try changing filters to explore more verified pandits.</p>
            </div>
          </div>
        ) : null}
        {filteredPandits.map((pandit) => (
          <article key={pandit.id} className="pandit-card">
            <div className="pandit-card-header">
              <img src={pandit.image} alt={pandit.name} className="pandit-avatar" loading="lazy" />
              <div>
                <h3>{pandit.name}</h3>
                <p className="pandit-bio">{pandit.bio}</p>
              </div>
            </div>

            <div className="pandit-meta-grid">
              <span>🗣️ {pandit.languages.join(", ")}</span>
              <span>📿 {pandit.experienceYears}+ years</span>
              <span>📍 {pandit.city}</span>
              <span>🛕 {pandit.bookingsCount.toLocaleString("en-IN")} bookings</span>
            </div>

            <div className="pandit-rating-row">
              <span className="pandit-stars">{starText(pandit.rating)}</span>
              <span>{pandit.rating.toFixed(1)} / 5</span>
              <span className={`pandit-mode ${pandit.onlinePuja ? "active" : ""}`}>Online: {pandit.onlinePuja ? "Yes" : "No"}</span>
              <span className={`pandit-mode ${pandit.faceToFacePuja ? "active" : ""}`}>
                Face to Face: {pandit.faceToFacePuja ? "Yes" : "No"}
              </span>
            </div>

            <div className="pandit-card-actions">
              <Link href={`/pandits/${pandit.slug}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
