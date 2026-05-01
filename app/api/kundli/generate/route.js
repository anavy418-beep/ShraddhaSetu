import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

const SUPPORTED_PROVIDERS = {
  freeastrologyapi: {
    defaultBaseUrl: "https://json.freeastrologyapi.com",
    generatePath: "/planets/extended",
    authHeader: "x-api-key"
  },
  astrologyapi: {
    defaultBaseUrl: "",
    generatePath: "/kundli/generate",
    authHeader: "x-api-key"
  },
  astrosage: {
    defaultBaseUrl: "",
    generatePath: "/kundli/generate",
    authHeader: "x-api-key"
  },
  prokerala: {
    defaultBaseUrl: "",
    generatePath: "/v2/astrology/kundli",
    authHeader: "authorization"
  },
  kundliapi: {
    defaultBaseUrl: "https://kundliapi.com/api",
    generatePath: "/planet/get_all_planet_data",
    authHeader: "x-api-key"
  }
};

function parseDateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function parseTimeParts(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) {
    return null;
  }
  return {
    hours: Number(match[1]),
    minutes: Number(match[2])
  };
}

function parseNumeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

const DEFAULT_FALLBACK_COORDS = {
  latitude: 25.7585,
  longitude: 84.1489
};

const CITY_COORDINATE_MAP = {
  delhi: { latitude: 28.6139, longitude: 77.209 },
  "new delhi": { latitude: 28.6139, longitude: 77.209 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  patna: { latitude: 25.5941, longitude: 85.1376 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  haridwar: { latitude: 29.9457, longitude: 78.1642 },
  ujjain: { latitude: 23.1765, longitude: 75.7885 },
  ballia: { latitude: 25.7585, longitude: 84.1489 }
};

function resolveCoordinates(birthPlace, latitude, longitude) {
  if (latitude !== null && longitude !== null) {
    return { latitude, longitude };
  }

  const lookupKey = String(birthPlace || "").trim().toLowerCase();
  if (lookupKey && CITY_COORDINATE_MAP[lookupKey]) {
    return CITY_COORDINATE_MAP[lookupKey];
  }

  return DEFAULT_FALLBACK_COORDS;
}

function demoResult(payload) {
  return {
    fullName: payload.fullName,
    gender: payload.gender,
    birthDetails: {
      dateOfBirth: payload.dateOfBirth,
      timeOfBirth: payload.timeOfBirth,
      birthPlace: payload.birthPlace,
      latitude: payload.latitude,
      longitude: payload.longitude,
      language: payload.language
    },
    rashi: "Taurus",
    nakshatra: "Rohini",
    lagna: "Cancer",
    mangalDosha: "No significant Mangal Dosha observed in demo preview.",
    planets: [
      { name: "Sun", sign: "Aries", house: 10, degree: "12.40", retrograde: false },
      { name: "Moon", sign: "Taurus", house: 11, degree: "03.12", retrograde: false },
      { name: "Mars", sign: "Gemini", house: 12, degree: "17.89", retrograde: false },
      { name: "Mercury", sign: "Aries", house: 10, degree: "21.05", retrograde: false },
      { name: "Jupiter", sign: "Pisces", house: 9, degree: "08.17", retrograde: false },
      { name: "Venus", sign: "Pisces", house: 9, degree: "27.91", retrograde: false },
      { name: "Saturn", sign: "Aquarius", house: 8, degree: "15.63", retrograde: true },
      { name: "Rahu", sign: "Virgo", house: 3, degree: "11.39", retrograde: true },
      { name: "Ketu", sign: "Pisces", house: 9, degree: "11.39", retrograde: true }
    ],
    houses: Array.from({ length: 12 }, (_, index) => ({
      house: index + 1,
      sign: ["Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini"][index],
      lord: ["Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter", "Mars", "Venus", "Mercury"][index]
    })),
    summary:
      "Demo preview: Strong dharma and finance houses indicate stable growth. Emotional balance and disciplined planning will help in career and relationship decisions."
  };
}

function normalizePlanetList(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item, index) => ({
    name: item.name || item.planet || item.planet_name || `Planet ${index + 1}`,
    sign: item.sign || item.zodiac_sign_name || item.rashi || item.zodiac || "N/A",
    house: Number(item.house ?? item.house_number ?? item.house_no ?? item.housePosition ?? 0) || null,
    degree: String(item.degree ?? item.normDegree ?? item.fullDegree ?? item.longitude ?? "N/A"),
    retrograde: Boolean(
      item.isRetro || item.is_retro || item.retrograde || item.isRetrograde || String(item.retro || "").toLowerCase() === "true"
    ),
    nakshatra: item.nakshatra || item.nakshatra_name || null
  }));
}

function normalizeHouses(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item, index) => ({
    house: Number(item.house ?? item.house_number ?? index + 1) || index + 1,
    sign: item.sign || item.rashi || item.zodiac_sign || "N/A",
    lord: item.lord || item.rashi_lord || item.house_lord || "N/A",
    occupants: Array.isArray(item.occupants) ? item.occupants.join(", ") : item.occupants || ""
  }));
}

function normalizeKundliResult(raw, payload) {
  const planetsRaw =
    raw?.data?.planets ||
    raw?.data?.planetData?.planetList ||
    raw?.responseData?.data?.[0]?.planetData?.planetList ||
    raw?.responseData?.data?.[0]?.planets ||
    raw?.output ||
    raw?.planets ||
    [];

  const housesRaw =
    raw?.data?.houses ||
    raw?.responseData?.data?.[0]?.houses ||
    raw?.responseData?.data?.[0]?.houseData?.houseList ||
    raw?.houses ||
    [];

  const astroSummary = raw?.responseData?.data?.[0]?.astrodata || raw?.data?.astrodata || raw?.astrodata || {};

  return {
    fullName: payload.fullName,
    gender: payload.gender,
    birthDetails: {
      dateOfBirth: payload.dateOfBirth,
      timeOfBirth: payload.timeOfBirth,
      birthPlace: payload.birthPlace,
      latitude: payload.latitude,
      longitude: payload.longitude,
      language: payload.language
    },
    rashi: astroSummary.sign || raw?.rashi || raw?.moon_sign || "N/A",
    nakshatra: astroSummary.nakshatra || raw?.nakshatra || "N/A",
    lagna:
      astroSummary.ascendant ||
      astroSummary.lagna ||
      raw?.lagna ||
      raw?.ascendant ||
      planetsRaw.find((item) => String(item?.name || "").toLowerCase() === "ascendant")?.sign ||
      "N/A",
    mangalDosha:
      raw?.mangal_dosha?.description ||
      raw?.mangalDosha?.description ||
      raw?.manglik_dosh ||
      raw?.dosha?.mangal ||
      "Not provided by selected API.",
    planets: normalizePlanetList(planetsRaw),
    houses: normalizeHouses(housesRaw),
    summary:
      raw?.summary ||
      raw?.prediction ||
      raw?.short_prediction ||
      raw?.responseData?.data?.[0]?.summary ||
      "Detailed API summary not provided. Refer to planetary and house placements."
  };
}

function buildProviderRequestPayload(provider, payload) {
  const dateParts = parseDateParts(payload.dateOfBirth);
  const timeParts = parseTimeParts(payload.timeOfBirth);
  const timezone = parseNumeric(process.env.KUNDLI_API_TIMEZONE) ?? 5.5;

  return {
    full_name: payload.fullName,
    name: payload.fullName,
    gender: payload.gender,
    language: payload.language,
    place: payload.birthPlace,
    city: payload.birthPlace,
    latitude: payload.latitude,
    longitude: payload.longitude,
    lat: payload.latitude,
    lon: payload.longitude,
    timezone,
    tzone: timezone,
    year: dateParts.year,
    month: dateParts.month,
    date: dateParts.day,
    day: dateParts.day,
    hours: timeParts.hours,
    hour: timeParts.hours,
    minutes: timeParts.minutes,
    min: timeParts.minutes,
    seconds: 0,
    settings:
      provider === "freeastrologyapi"
        ? {
            observation_point: "topocentric",
            ayanamsha: "lahiri"
          }
        : undefined
  };
}

async function callProvider(providerName, payload) {
  const provider = SUPPORTED_PROVIDERS[providerName] || SUPPORTED_PROVIDERS.freeastrologyapi;
  const apiKey = process.env.KUNDLI_API_KEY || "";
  const configuredBaseUrl = (process.env.KUNDLI_API_BASE_URL || "").trim();
  const baseUrl = configuredBaseUrl || provider.defaultBaseUrl;

  if (!apiKey || !baseUrl) {
    return {
      mode: "demo",
      provider: providerName,
      warning: "If API key is not configured, show demo Kundli preview.",
      result: demoResult(payload)
    };
  }

  const url = new URL(provider.generatePath || "", baseUrl).toString();
  const requestPayload = buildProviderRequestPayload(providerName, payload);
  const headers = {
    "Content-Type": "application/json"
  };

  if (provider.authHeader === "authorization") {
    headers.Authorization = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  } else {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestPayload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Kundli API failed (${response.status}): ${errorBody.slice(0, 180)}`);
  }

  const raw = await response.json();
  return {
    mode: "live",
    provider: providerName,
    result: normalizeKundliResult(raw, payload)
  };
}

function validateInput(body) {
  const fullName = (body?.fullName || "").trim();
  const gender = (body?.gender || "").trim();
  const dateOfBirth = (body?.dateOfBirth || "").trim();
  const timeOfBirth = (body?.timeOfBirth || "").trim();
  const birthPlace = (body?.birthPlace || "").trim();
  const latitude = parseNumeric(body?.latitude);
  const longitude = parseNumeric(body?.longitude);
  const language = (body?.language || "").trim() || "English";

  if (!fullName || !gender || !dateOfBirth || !timeOfBirth || !birthPlace) {
    return { error: "All fields are required." };
  }
  if (!parseDateParts(dateOfBirth)) {
    return { error: "Date of birth must be in YYYY-MM-DD format." };
  }
  if (!parseTimeParts(timeOfBirth)) {
    return { error: "Time of birth must be in HH:MM format." };
  }
  const resolvedCoordinates = resolveCoordinates(birthPlace, latitude, longitude);
  if (
    resolvedCoordinates.latitude < -90 ||
    resolvedCoordinates.latitude > 90 ||
    resolvedCoordinates.longitude < -180 ||
    resolvedCoordinates.longitude > 180
  ) {
    return { error: "Latitude/longitude values are out of range." };
  }

  return {
    value: {
      fullName,
      gender,
      dateOfBirth,
      timeOfBirth,
      birthPlace,
      latitude: resolvedCoordinates.latitude,
      longitude: resolvedCoordinates.longitude,
      language
    }
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = validateInput(body);
    if (parsed.error) {
      return jsonError(parsed.error, 400);
    }

    const provider = (process.env.KUNDLI_API_PROVIDER || "freeastrologyapi").toLowerCase();
    try {
      const result = await callProvider(provider, parsed.value);
      return jsonOk(result);
    } catch (providerError) {
      console.error(providerError);
      return jsonOk({
        mode: "demo",
        provider,
        warning: "Live Kundli API is temporarily unavailable. Showing demo Kundli preview.",
        result: demoResult(parsed.value)
      });
    }
  } catch (error) {
    console.error(error);
    return jsonError("Unable to generate kundli right now.", 500);
  }
}
