import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

function parseProfile(profile) {
  if (!profile || typeof profile !== "object") {
    return null;
  }
  const fullName = (profile.fullName || "").trim();
  const dateOfBirth = (profile.dateOfBirth || "").trim();
  const timeOfBirth = (profile.timeOfBirth || "").trim();
  const latitude = Number(profile.latitude);
  const longitude = Number(profile.longitude);
  if (!fullName || !dateOfBirth || !timeOfBirth || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const [hour, min] = timeOfBirth.split(":").map(Number);
  if (!year || !month || !day || !Number.isFinite(hour) || !Number.isFinite(min)) {
    return null;
  }

  return {
    fullName,
    year,
    month,
    day,
    hour,
    min,
    lat: latitude,
    lon: longitude
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const first = parseProfile(body?.firstPerson);
    const second = parseProfile(body?.secondPerson);
    if (!first || !second) {
      return jsonError("Valid firstPerson and secondPerson birth details are required.", 400);
    }

    const provider = (process.env.KUNDLI_API_PROVIDER || "freeastrologyapi").toLowerCase();
    const apiKey = process.env.KUNDLI_API_KEY || "";
    const baseUrl = process.env.KUNDLI_API_BASE_URL || "";

    if (!apiKey || !baseUrl) {
      return jsonOk({
        mode: "unconfigured",
        provider,
        message:
          "Match Making API is ready but currently not configured. Add KUNDLI_API_PROVIDER, KUNDLI_API_KEY and KUNDLI_API_BASE_URL to enable live matching."
      });
    }

    const endpoint =
      provider === "kundliapi" ? "/match/ashtakoot" : provider === "freeastrologyapi" ? "/api/v1/synastry/calculate" : "/kundli/match";
    const url = new URL(endpoint, baseUrl).toString();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        first,
        second
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return jsonOk({
        mode: "unsupported",
        provider,
        message: "Provider does not support the default match endpoint yet. Keep this route for future extension.",
        detail: `HTTP ${response.status}: ${errorBody.slice(0, 160)}`
      });
    }

    const raw = await response.json();
    return jsonOk({
      mode: "live",
      provider,
      compatibility: raw
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to process match request right now.", 500);
  }
}
