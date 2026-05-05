"use client";

import { useEffect, useMemo, useState } from "react";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function PanchangClient({ cities }) {
  const cityOptions = useMemo(() => {
    if (Array.isArray(cities) && cities.length) {
      return cities.map((city) => city.name).filter(Boolean);
    }
    return ["Delhi"];
  }, [cities]);

  const [selectedCity, setSelectedCity] = useState(cityOptions.includes("Delhi") ? "Delhi" : cityOptions[0] || "Delhi");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panchang, setPanchang] = useState({
    tithi: "-",
    nakshatra: "-",
    yoga: "-",
    karan: "-",
    sunrise: "-",
    sunset: "-",
    rahuKaal: "-"
  });

  useEffect(() => {
    let cancelled = false;

    const loadPanchang = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          city: selectedCity,
          date: selectedDate
        });
        const response = await fetch(`/api/panchang?${params.toString()}`, {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to fetch real Panchang");
        }

        const data = await response.json();
        if (cancelled) {
          return;
        }

        setPanchang({
          tithi: data?.tithi || "N/A",
          nakshatra: data?.nakshatra || "N/A",
          yoga: data?.yoga || "N/A",
          karan: data?.karan || "N/A",
          sunrise: data?.sunrise || "N/A",
          sunset: data?.sunset || "N/A",
          rahuKaal: data?.rahuKaal || "N/A"
        });
      } catch {
        if (cancelled) {
          return;
        }
        setError("Unable to fetch real Panchang");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPanchang();

    return () => {
      cancelled = true;
    };
  }, [selectedCity, selectedDate]);

  return (
    <div className="card">
      <div className="card-body">
        <div className="form-grid">
          <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>

        {loading && <p style={{ marginTop: 16 }}>Loading Panchang...</p>}
        {error && <p style={{ marginTop: 16, color: "#9f1239" }}>{error}</p>}

        <table style={{ marginTop: 20, opacity: loading ? 0.65 : 1 }}>
          <tbody>
            <tr>
              <th>Tithi</th>
              <td>{panchang.tithi}</td>
            </tr>
            <tr>
              <th>Nakshatra</th>
              <td>{panchang.nakshatra}</td>
            </tr>
            <tr>
              <th>Yog</th>
              <td>{panchang.yoga}</td>
            </tr>
            <tr>
              <th>Karan</th>
              <td>{panchang.karan}</td>
            </tr>
            <tr>
              <th>Sunrise</th>
              <td>{panchang.sunrise}</td>
            </tr>
            <tr>
              <th>Sunset</th>
              <td>{panchang.sunset}</td>
            </tr>
            <tr>
              <th>Rahu Kaal</th>
              <td>{panchang.rahuKaal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
