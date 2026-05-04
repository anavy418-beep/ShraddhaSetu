"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const initialForm = {
  fullName: "",
  gender: "Male",
  dateOfBirth: "",
  timeOfBirth: "",
  birthPlace: "",
  language: "English",
  latitude: "",
  longitude: ""
};

const PHOTON_API_URL = "https://photon.komoot.io/api/";
const PHOTON_MIN_QUERY_LENGTH = 2;
const PHOTON_MAX_SUGGESTIONS = 6;

function InfoRow({ label, value }) {
  return (
    <p style={{ margin: 0, color: "#5a4332" }}>
      <strong style={{ color: "#3f2a1d" }}>{label}:</strong> {value || "N/A"}
    </p>
  );
}

export default function KundliForm() {
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("");
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const suppressNextLookupRef = useRef(false);
  const placeSearchAbortRef = useRef(null);

  const hasResult = Boolean(result);

  const summaryText = useMemo(() => {
    if (!result?.prediction) {
      return "Detailed prediction is not available right now.";
    }
    return result.prediction;
  }, [result]);

  const remedies = useMemo(() => {
    if (!Array.isArray(result?.remedies) || result.remedies.length === 0) {
      return ["Consult a verified pandit for personalized puja recommendations based on your full chart."];
    }
    return result.remedies;
  }, [result]);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBirthPlace = (value) => {
    setForm((prev) => ({
      ...prev,
      birthPlace: value,
      latitude: "",
      longitude: ""
    }));
  };

  const onBirthPlaceInput = (value) => {
    suppressNextLookupRef.current = false;
    setBirthPlace(value);
    setShowSuggestions(true);
  };

  useEffect(() => {
    const query = form.birthPlace.trim();

    if (suppressNextLookupRef.current) {
      suppressNextLookupRef.current = false;
      return undefined;
    }

    if (query.length < PHOTON_MIN_QUERY_LENGTH) {
      setPlaceSuggestions([]);
      setIsSearchingPlace(false);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      placeSearchAbortRef.current?.abort();
      const controller = new AbortController();
      placeSearchAbortRef.current = controller;
      setIsSearchingPlace(true);

      try {
        const url = `${PHOTON_API_URL}?q=${encodeURIComponent(query)}&limit=${PHOTON_MAX_SUGGESTIONS}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Unable to fetch location suggestions.");
        }

        const data = await response.json();
        const features = Array.isArray(data?.features) ? data.features : [];
        const suggestions = features
          .map((feature) => {
            const props = feature?.properties || {};
            const [lng, lat] = feature?.geometry?.coordinates || [];
            const numericLat = Number(lat);
            const numericLng = Number(lng);
            const label = [props.name, props.city || props.county || props.state, props.country]
              .filter(Boolean)
              .join(", ");

            if (!label || !Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
              return null;
            }

            return { label, lat: numericLat, lng: numericLng };
          })
          .filter(Boolean);

        setPlaceSuggestions(suggestions);
      } catch (lookupError) {
        if (lookupError.name !== "AbortError") {
          setPlaceSuggestions([]);
        }
      } finally {
        setIsSearchingPlace(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [form.birthPlace]);

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setApiMessage("");
    setMode("");

    try {
      const payload = { ...form };
      if (typeof payload.latitude !== "number" || typeof payload.longitude !== "number") {
        delete payload.latitude;
        delete payload.longitude;
      }
      console.log("Submitting Kundli form", payload);

      const response = await fetch("/api/kundli/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log("Kundli API response", data);
      if (!response.ok) {
        throw new Error(data.error || "Unable to generate kundli.");
      }

      setMode(data.mode || "");
      setResult(data.result || data || null);
      if (data.mode === "demo") {
        setApiMessage(data.warning || "AI Kundli generation is temporarily unavailable. Showing demo Kundli report.");
      } else if (data.mode === "ai") {
        setApiMessage("AI Kundli generated successfully.");
      } else {
        setApiMessage(data.warning || "AI Kundli generated successfully.");
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to generate kundli right now.";
      setError(message);
      setMode("");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="card kundli-print-hide">
          <div className="card-body">
            <h2 style={{ marginTop: 0, color: "#5f1c1f" }}>Generate Kundli Report</h2>
            <p style={{ marginTop: 0, color: "#6f5b4d" }}>
              Fill your birth details to generate a structured Kundli report with panchang, graha positions, dosha insights,
              and suggested pujas.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(event) => setValue("fullName", event.target.value)}
                />
                <select value={form.gender} onChange={(event) => setValue("gender", event.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <input
                  required
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) => setValue("dateOfBirth", event.target.value)}
                />
                <input
                  required
                  type="time"
                  value={form.timeOfBirth}
                  onChange={(event) => setValue("timeOfBirth", event.target.value)}
                />
                <div style={{ position: "relative" }}>
                  <input
                    required
                    type="text"
                    placeholder="Birth place / city"
                    value={form.birthPlace || ""}
                    onChange={(event) => onBirthPlaceInput(event.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                  />
                  {showSuggestions && (placeSuggestions.length > 0 || isSearchingPlace) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        right: 0,
                        background: "#fffdf8",
                        border: "1px solid #e3d2b9",
                        borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(63,42,29,0.12)",
                        zIndex: 20,
                        maxHeight: 220,
                        overflowY: "auto"
                      }}
                    >
                      {isSearchingPlace && (
                        <div style={{ padding: "10px 12px", color: "#7f1d1d", fontSize: "0.92rem" }}>Searching places...</div>
                      )}
                      {!isSearchingPlace &&
                        placeSuggestions.map((suggestion, index) => (
                          <button
                            type="button"
                            key={`${suggestion.label}-${index}`}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setForm((prev) => ({
                                ...prev,
                                birthPlace: suggestion.label,
                                latitude: suggestion.lat,
                                longitude: suggestion.lng
                              }));
                              setPlaceSuggestions([]);
                              setShowSuggestions(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 12px",
                              border: 0,
                              borderBottom: "1px solid #efe2cc",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#4a3426"
                            }}
                          >
                            {suggestion.label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <select value={form.language} onChange={(event) => setValue("language", event.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Generating Kundli Report..." : "Generate Kundli"}
                </button>
              </div>
            </form>

            {isLoading && (
              <p style={{ marginTop: 14, color: "#7a4a13", background: "#fff3dc", padding: "10px 12px", borderRadius: 10 }}>
                Calculating chart details, panchang, and recommended pujas...
              </p>
            )}

            {error && (
              <p style={{ marginTop: 14, color: "#991b1b", background: "#fee2e2", padding: "10px 12px", borderRadius: 10 }}>
                {error}
              </p>
            )}

            {apiMessage && (
              <p style={{ marginTop: 14, color: "#7a4a13", background: "#fff3dc", padding: "10px 12px", borderRadius: 10 }}>
                {apiMessage}
              </p>
            )}

            {!hasResult && !error && !isLoading && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>Professional Kundli Preview</h3>
                  <p style={{ marginBottom: 0 }}>
                    Your report will include user details, basic panchang, rashi, nakshatra, lagna, planet positions,
                    houses, mangal dosha status, prediction summary, and remedies with direct booking suggestions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {hasResult && (
          <div className="card kundli-report" style={{ marginTop: 18 }}>
            <div className="card-body">
              <div className="row kundli-print-hide" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="row" style={{ alignItems: "center" }}>
                  <h3 style={{ margin: 0, color: "#5f1c1f" }}>Kundli Report</h3>
                  {mode === "ai" && (
                    <span className="chip" style={{ marginLeft: 8, background: "#fff2cc", borderColor: "#e2c17d", color: "#7f1d1d" }}>
                      AI Kundli
                    </span>
                  )}
                </div>
                <button className="btn btn-outline" type="button" onClick={handlePrint}>
                  Download / Print Kundli
                </button>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>User Details</h4>
                  <div className="form-grid" style={{ gap: 10 }}>
                    <InfoRow label="Full Name" value={result.userDetails?.fullName} />
                    <InfoRow label="Gender" value={result.userDetails?.gender} />
                    <InfoRow label="Date of Birth" value={result.userDetails?.dateLabel || result.userDetails?.dateOfBirth} />
                    <InfoRow label="Time of Birth" value={result.userDetails?.timeOfBirth} />
                    <InfoRow label="Birth Place / City" value={result.userDetails?.birthPlace} />
                    <InfoRow label="Language" value={result.userDetails?.language} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Basic Panchang Details</h4>
                  <div className="form-grid" style={{ gap: 10 }}>
                    <InfoRow label="Tithi" value={result.panchang?.tithi} />
                    <InfoRow label="Nakshatra" value={result.panchang?.nakshatra} />
                    <InfoRow label="Yoga" value={result.panchang?.yoga} />
                    <InfoRow label="Karana" value={result.panchang?.karana} />
                    <InfoRow label="Sunrise" value={result.panchang?.sunrise} />
                    <InfoRow label="Sunset" value={result.panchang?.sunset} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Core Kundli Indicators</h4>
                  <div className="form-grid" style={{ gap: 10 }}>
                    <InfoRow label="Rashi" value={result.rashi} />
                    <InfoRow label="Nakshatra" value={result.nakshatra} />
                    <InfoRow label="Lagna / Ascendant" value={result.lagna} />
                    <InfoRow label="Tithi" value={result.tithi} />
                    <InfoRow label="Yoga" value={result.yoga} />
                    <InfoRow label="Karana" value={result.karana} />
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Planet Positions</h4>
                  {result.planetPositions?.length ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Planet</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Sign</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>House</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Degree</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Retrograde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.planetPositions.map((planet) => (
                            <tr key={`${planet.name}-${planet.house || planet.degree}`}>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.name}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.sign}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.house || "N/A"}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.degree || "N/A"}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>
                                {planet.retrograde ? "Yes" : "No"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ marginBottom: 0 }}>Planet positions are not provided by the selected API.</p>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Houses / Bhav</h4>
                  {result.houses?.length ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Bhav</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Sign</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Lord</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Occupants</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.houses.map((house) => (
                            <tr key={`house-${house.house}-${house.sign}`}>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.house}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.sign}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.lord}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.occupants || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ marginBottom: 0 }}>House details are not provided by the selected API.</p>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Mangal Dosha</h4>
                  <p style={{ marginTop: 0, marginBottom: 8 }}>
                    <strong>Status:</strong> {result.mangalDosha?.status || "Not provided"}
                  </p>
                  <p style={{ margin: 0 }}>{result.mangalDosha?.details || "Dosha details not available."}</p>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Short Prediction</h4>
                  <p style={{ marginBottom: 0 }}>{summaryText}</p>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 14 }}>
                <div className="card-body">
                  <h4 style={{ marginTop: 0 }}>Remedies / Suggested Puja</h4>
                  <ul style={{ marginTop: 0, paddingLeft: 18, color: "#5a4332" }}>
                    {remedies.map((remedy) => (
                      <li key={remedy} style={{ marginBottom: 8 }}>
                        {remedy}
                      </li>
                    ))}
                  </ul>

                  <div className="row kundli-print-hide" style={{ marginTop: 8 }}>
                    {result.recommendedPujas?.map((puja) => (
                      <Link key={puja.slug} href={`/booking?puja=${puja.slug}`} className="btn btn-primary">
                        Book Recommended Puja
                      </Link>
                    ))}
                  </div>

                  {result.recommendedPujas?.length > 0 && (
                    <div style={{ marginTop: 10, color: "#6f5b4d" }}>
                      {result.recommendedPujas.map((puja) => (
                        <p key={`${puja.slug}-reason`} style={{ margin: "4px 0" }}>
                          <strong>{puja.title || puja.name}:</strong> {puja.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .kundli-print-hide {
            display: none !important;
          }

          .kundli-report {
            border: 1px solid #d9c3a0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .kundli-report .card {
            border: 1px solid #e6d6be !important;
            box-shadow: none !important;
            break-inside: avoid;
          }

          .page-header,
          .nav-wrap,
          .footer,
          .wa-fab {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
