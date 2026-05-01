"use client";

import { useMemo, useState } from "react";

const initialForm = {
  fullName: "",
  gender: "Male",
  dateOfBirth: "",
  timeOfBirth: "",
  birthPlace: "",
  language: "English"
};

export default function KundliForm() {
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [result, setResult] = useState(null);

  const hasResult = Boolean(result);

  const summaryText = useMemo(() => {
    if (!result?.summary) {
      return "No summary provided.";
    }
    return result.summary;
  }, [result]);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleGenerate(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setApiMessage("");

    try {
      const response = await fetch("/api/kundli/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to generate kundli.");
      }

      setResult(data.result || null);
      if (data.mode === "demo") {
        setApiMessage(data.warning || "If API key is not configured, show demo Kundli preview.");
      } else {
        setApiMessage("Live Kundli generated successfully.");
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to generate kundli right now.";
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleGenerate}>
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
                <input
                  required
                  type="text"
                  placeholder="Birth place / city"
                  value={form.birthPlace}
                  onChange={(event) => setValue("birthPlace", event.target.value)}
                />
                <select value={form.language} onChange={(event) => setValue("language", event.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Generating Kundli..." : "Generate Kundli"}
                </button>
              </div>
            </form>

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

            {!hasResult && !error && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>Result Preview</h3>
                  <p>
                    Fill the form and generate Kundli. If API key is not configured, a demo Kundli preview will be shown
                    here.
                  </p>
                </div>
              </div>
            )}

            {hasResult && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-body">
                  <h3 style={{ marginTop: 0 }}>Kundli Result</h3>
                  <div className="form-grid">
                    <p>
                      <strong>Rashi:</strong> {result.rashi || "N/A"}
                    </p>
                    <p>
                      <strong>Nakshatra:</strong> {result.nakshatra || "N/A"}
                    </p>
                    <p>
                      <strong>Lagna:</strong> {result.lagna || "N/A"}
                    </p>
                    <p>
                      <strong>Mangal Dosha:</strong> {result.mangalDosha || "Not provided"}
                    </p>
                  </div>

                  <h4 style={{ marginTop: 16 }}>Planet Positions</h4>
                  {result.planets?.length ? (
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
                          {result.planets.map((planet) => (
                            <tr key={`${planet.name}-${planet.house}`}>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.name}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.sign}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.house || "N/A"}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{planet.degree}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>
                                {planet.retrograde ? "Yes" : "No"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Planet positions are not provided by the selected API.</p>
                  )}

                  <h4 style={{ marginTop: 16 }}>Houses</h4>
                  {result.houses?.length ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>House</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Sign</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Lord</th>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Occupants</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.houses.map((house) => (
                            <tr key={`house-${house.house}`}>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.house}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.sign}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>{house.lord}</td>
                              <td style={{ padding: "8px 6px", borderTop: "1px solid #ead7bc" }}>
                                {house.occupants || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>House details are not provided by the selected API.</p>
                  )}

                  <div className="card" style={{ marginTop: 16 }}>
                    <div className="card-body">
                      <h4 style={{ marginTop: 0 }}>Summary</h4>
                      <p>{summaryText}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
