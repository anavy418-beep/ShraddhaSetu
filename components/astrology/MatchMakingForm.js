"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PHOTON_API_URL = "https://photon.komoot.io/api/";
const PHOTON_MIN_QUERY_LENGTH = 2;
const PHOTON_MAX_SUGGESTIONS = 6;

const initialPerson = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  birthPlace: "",
  latitude: "",
  longitude: "",
  state: "",
  country: ""
};

const initialForm = {
  boy: { ...initialPerson },
  girl: { ...initialPerson }
};

function buildPlaceLabel(props) {
  return [props?.name, props?.city || props?.county || props?.state, props?.country].filter(Boolean).join(", ");
}

function mapFeatureToSuggestion(feature) {
  const props = feature?.properties || {};
  const [lng, lat] = feature?.geometry?.coordinates || [];
  const numericLat = Number(lat);
  const numericLng = Number(lng);
  const label = buildPlaceLabel(props);

  if (!label || !Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
    return null;
  }

  return {
    label,
    lat: numericLat,
    lng: numericLng,
    state: props?.state || props?.county || "",
    country: props?.country || ""
  };
}

function PlaceInput({
  id,
  label,
  value,
  suggestions,
  showSuggestions,
  isLoading,
  onInput,
  onFocus,
  onBlur,
  onSelect
}) {
  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={id} style={{ display: "block", marginBottom: 6, color: "#5a4332", fontSize: "0.92rem" }}>
        {label}
      </label>
      <input
        id={id}
        required
        type="text"
        placeholder="Birth Place / City"
        value={value || ""}
        onChange={(event) => onInput(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
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
          {isLoading && <div style={{ padding: "10px 12px", color: "#7f1d1d", fontSize: "0.92rem" }}>Searching places...</div>}
          {!isLoading &&
            (suggestions || []).map((suggestion, index) => (
              <button
                key={`${suggestion?.label || "place"}-${index}`}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(suggestion);
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
                {suggestion?.label || "Unknown location"}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function MatchMakingForm() {
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [report, setReport] = useState(null);
  const [activeField, setActiveField] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [lookupError, setLookupError] = useState("");

  const placeSearchAbortRef = useRef(null);

  const activeQuery = useMemo(() => {
    if (!activeField) {
      return "";
    }
    const [personKey] = activeField.split(".");
    return form?.[personKey]?.birthPlace?.trim?.() || "";
  }, [activeField, form]);

  useEffect(() => {
    if (!activeField || activeQuery.length < PHOTON_MIN_QUERY_LENGTH) {
      setPlaceSuggestions([]);
      setIsSearchingPlace(false);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      placeSearchAbortRef.current?.abort?.();
      const controller = new AbortController();
      placeSearchAbortRef.current = controller;
      setIsSearchingPlace(true);
      setLookupError("");

      try {
        const url = `${PHOTON_API_URL}?q=${encodeURIComponent(activeQuery)}&limit=${PHOTON_MAX_SUGGESTIONS}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response?.ok) {
          throw new Error("Unable to fetch place suggestions.");
        }

        const data = await response.json();
        const features = Array.isArray(data?.features) ? data.features : [];
        const mapped = features.map(mapFeatureToSuggestion).filter(Boolean);
        setPlaceSuggestions(mapped);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setPlaceSuggestions([]);
          setLookupError("Autocomplete is unavailable right now. You can type city manually.");
        }
      } finally {
        setIsSearchingPlace(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [activeField, activeQuery]);

  function updatePerson(personKey, nextPartial) {
    setForm((prev) => ({
      ...prev,
      [personKey]: {
        ...prev?.[personKey],
        ...nextPartial
      }
    }));
  }

  function handlePlaceInput(personKey, value) {
    setActiveField(`${personKey}.birthPlace`);
    setShowSuggestions(true);
    updatePerson(personKey, {
      birthPlace: value,
      latitude: "",
      longitude: "",
      state: "",
      country: ""
    });
  }

  function handlePlaceSelect(personKey, suggestion) {
    updatePerson(personKey, {
      birthPlace: suggestion?.label || "",
      latitude: suggestion?.lat ?? "",
      longitude: suggestion?.lng ?? "",
      state: suggestion?.state || "",
      country: suggestion?.country || ""
    });
    setPlaceSuggestions([]);
    setShowSuggestions(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setSubmitError("");

    try {
      const payload = {
        boy: {
          name: form?.boy?.name || "",
          dateOfBirth: form?.boy?.dateOfBirth || "",
          timeOfBirth: form?.boy?.timeOfBirth || "",
          birthPlace: form?.boy?.birthPlace || "",
          latitude: form?.boy?.latitude || "",
          longitude: form?.boy?.longitude || ""
        },
        girl: {
          name: form?.girl?.name || "",
          dateOfBirth: form?.girl?.dateOfBirth || "",
          timeOfBirth: form?.girl?.timeOfBirth || "",
          birthPlace: form?.girl?.birthPlace || "",
          latitude: form?.girl?.latitude || "",
          longitude: form?.girl?.longitude || ""
        }
      };

      const response = await fetch("/api/match-making/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log("Match Making API Response:", data);

      if (!response?.ok) {
        throw new Error(data?.error || "Unable to generate compatibility report.");
      }

      setReport(data || null);
    } catch (error) {
      setReport(null);
      setSubmitError(error instanceof Error ? error.message : "Unable to generate compatibility report.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <h2 style={{ marginTop: 0 }}>Boy Details</h2>
          <div className="form-grid">
            <input
              required
              type="text"
              placeholder="Name"
              value={form?.boy?.name || ""}
              onChange={(event) => updatePerson("boy", { name: event.target.value })}
            />
            <input
              required
              type="date"
              value={form?.boy?.dateOfBirth || ""}
              onChange={(event) => updatePerson("boy", { dateOfBirth: event.target.value })}
            />
            <input
              required
              type="time"
              value={form?.boy?.timeOfBirth || ""}
              onChange={(event) => updatePerson("boy", { timeOfBirth: event.target.value })}
            />
            <PlaceInput
              id="boy-birth-place"
              label="Boy Birth Place / City"
              value={form?.boy?.birthPlace || ""}
              suggestions={activeField === "boy.birthPlace" ? placeSuggestions : []}
              showSuggestions={showSuggestions && activeField === "boy.birthPlace"}
              isLoading={isSearchingPlace && activeField === "boy.birthPlace"}
              onInput={(value) => handlePlaceInput("boy", value)}
              onFocus={() => {
                setActiveField("boy.birthPlace");
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onSelect={(suggestion) => handlePlaceSelect("boy", suggestion)}
            />
          </div>

          <h2 style={{ marginTop: 16 }}>Girl Details</h2>
          <div className="form-grid">
            <input
              required
              type="text"
              placeholder="Name"
              value={form?.girl?.name || ""}
              onChange={(event) => updatePerson("girl", { name: event.target.value })}
            />
            <input
              required
              type="date"
              value={form?.girl?.dateOfBirth || ""}
              onChange={(event) => updatePerson("girl", { dateOfBirth: event.target.value })}
            />
            <input
              required
              type="time"
              value={form?.girl?.timeOfBirth || ""}
              onChange={(event) => updatePerson("girl", { timeOfBirth: event.target.value })}
            />
            <PlaceInput
              id="girl-birth-place"
              label="Girl Birth Place / City"
              value={form?.girl?.birthPlace || ""}
              suggestions={activeField === "girl.birthPlace" ? placeSuggestions : []}
              showSuggestions={showSuggestions && activeField === "girl.birthPlace"}
              isLoading={isSearchingPlace && activeField === "girl.birthPlace"}
              onInput={(value) => handlePlaceInput("girl", value)}
              onFocus={() => {
                setActiveField("girl.birthPlace");
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onSelect={(suggestion) => handlePlaceSelect("girl", suggestion)}
            />
          </div>

          {lookupError && (
            <p style={{ marginTop: 10, color: "#7a4a13", background: "#fff3dc", padding: "10px 12px", borderRadius: 10 }}>
              {lookupError}
            </p>
          )}

          <button className="btn btn-primary" style={{ marginTop: 14 }} type="submit" disabled={isLoading}>
            {isLoading ? "Checking..." : "Check Compatibility"}
          </button>
        </form>

        {submitError && (
          <p style={{ marginTop: 12, color: "#991b1b", background: "#fee2e2", padding: "10px 12px", borderRadius: 10 }}>
            {submitError}
          </p>
        )}

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Compatibility Report</h3>
            {!report && <p>Guna score, dosha summary and compatibility notes will be shown here.</p>}

            {report && (
              <div>
                <p style={{ margin: "6px 0", color: "#5a4332" }}>
                  <strong>Total Compatibility Score:</strong> {report?.score ?? "N/A"}
                </p>
                <p style={{ margin: "6px 0", color: "#5a4332" }}>
                  <strong>Guna Score:</strong> {report?.gunaScore || "N/A"}
                </p>
                <p style={{ margin: "6px 0", color: "#5a4332" }}>
                  <strong>Compatibility Level:</strong> {report?.compatibilityLevel || "N/A"}
                </p>
                <p style={{ margin: "6px 0", color: "#5a4332" }}>
                  <strong>Summary:</strong> {report?.summary || "Not available"}
                </p>

                <div style={{ marginTop: 10 }}>
                  <h4 style={{ margin: "8px 0" }}>Manglik Status</h4>
                  <p style={{ margin: "4px 0", color: "#5a4332" }}>
                    <strong>Boy:</strong> {report?.manglikStatus?.boy || "Not available"}
                  </p>
                  <p style={{ margin: "4px 0", color: "#5a4332" }}>
                    <strong>Girl:</strong> {report?.manglikStatus?.girl || "Not available"}
                  </p>
                  <p style={{ margin: "4px 0", color: "#5a4332" }}>
                    <strong>Result:</strong> {report?.manglikStatus?.result || "Not available"}
                  </p>
                </div>

                <div style={{ marginTop: 10 }}>
                  <h4 style={{ margin: "8px 0" }}>Dosha Summary</h4>
                  <ul style={{ marginTop: 0, paddingLeft: 18, color: "#5a4332" }}>
                    {(report?.doshaSummary || []).map((item, index) => (
                      <li key={`dosha-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 10 }}>
                  <h4 style={{ margin: "8px 0" }}>Strengths</h4>
                  <ul style={{ marginTop: 0, paddingLeft: 18, color: "#5a4332" }}>
                    {(report?.strengths || []).map((item, index) => (
                      <li key={`strength-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 10 }}>
                  <h4 style={{ margin: "8px 0" }}>Concerns</h4>
                  <ul style={{ marginTop: 0, paddingLeft: 18, color: "#5a4332" }}>
                    {(report?.concerns || []).map((item, index) => (
                      <li key={`concern-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 10 }}>
                  <h4 style={{ margin: "8px 0" }}>Recommendations</h4>
                  <ul style={{ marginTop: 0, paddingLeft: 18, color: "#5a4332" }}>
                    {(report?.recommendations || []).map((item, index) => (
                      <li key={`recommendation-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 10 }}>
                  <h4 style={{ margin: "8px 0" }}>Marriage Advice</h4>
                  <p style={{ margin: 0, color: "#5a4332" }}>{report?.marriageAdvice || "Not available"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
