import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

const CITY_COORDINATE_MAP = {
  delhi: { latitude: 28.6139, longitude: 77.209 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  patna: { latitude: 25.5941, longitude: 85.1376 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  surat: { latitude: 21.1702, longitude: 72.8311 },
  ujjain: { latitude: 23.1765, longitude: 75.7885 },
  haridwar: { latitude: 29.9457, longitude: 78.1642 },
  visakhapatnam: { latitude: 17.6868, longitude: 83.2185 }
};

const DEFAULT_COORDINATES = CITY_COORDINATE_MAP.delhi;

let tokenCache = {
  token: "",
  expiresAt: 0
};

function normalizeCityKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveCoordinates(city) {
  const key = normalizeCityKey(city);
  return CITY_COORDINATE_MAP[key] || DEFAULT_COORDINATES;
}

function parseDateParam(value) {
  const date = String(value || "").trim();
  if (!date) {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  return date;
}

function pickText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = pickText(item);
      if (text) {
        return text;
      }
    }
    return "";
  }
  if (typeof value === "object") {
    return (
      pickText(value.name) ||
      pickText(value.value) ||
      pickText(value.title) ||
      pickText(value.label) ||
      pickText(value.start) ||
      pickText(value.time) ||
      ""
    );
  }
  return "";
}

function pickPeriod(value) {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    const first = value[0];
    const start = pickText(first?.start);
    const end = pickText(first?.end);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return pickText(first);
  }
  if (typeof value === "object") {
    const start = pickText(value.start);
    const end = pickText(value.end);
    if (start && end) {
      return `${start} - ${end}`;
    }
  }
  return pickText(value);
}

function formatApiDateTime(dateValue) {
  return `${dateValue}T06:00:00+05:30`;
}

async function getProkeralaAccessToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token;
  }

  const clientId = (process.env.PROKERALA_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PROKERALA_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    throw new Error("missing_credentials");
  }

  const tokenUrl = (process.env.PANCHANG_TOKEN_URL || "https://api.prokerala.com/token").trim();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`token_error:${response.status}:${text.slice(0, 200)}`);
  }

  const data = await response.json();
  const accessToken = data?.access_token || "";
  const expiresIn = Number(data?.expires_in || 3600);
  if (!accessToken) {
    throw new Error("token_error:missing_access_token");
  }

  tokenCache = {
    token: accessToken,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000
  };

  return accessToken;
}

async function fetchProkeralaPanchang(dateValue, latitude, longitude) {
  const token = await getProkeralaAccessToken();
  const baseUrl = (process.env.PANCHANG_API_BASE_URL || "https://api.prokerala.com").replace(/\/$/, "");
  const coordinates = `${latitude},${longitude}`;
  const datetime = formatApiDateTime(dateValue);

  const params = new URLSearchParams({
    ayanamsa: "1",
    coordinates,
    datetime,
    timezone: "Asia/Kolkata",
    la: "en"
  });

  const endpoints = ["/v2/astrology/panchang/advanced", "/v2/astrology/panchang"];
  let lastError = null;

  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 404) {
      continue;
    }

    const text = await response.text();
    lastError = new Error(`panchang_error:${response.status}:${text.slice(0, 200)}`);
    break;
  }

  throw lastError || new Error("panchang_error:not_found");
}

function normalizePanchangPayload(payload) {
  const data = payload?.data || payload || {};
  const inauspicious = data?.inauspicious_period || data?.inauspiciousPeriod || {};
  const rahuSource = inauspicious?.rahu_kaal || inauspicious?.rahuKaal || data?.rahu_kaal || data?.rahuKaal;

  return {
    tithi: pickText(data?.tithi || data?.Tithi) || "N/A",
    nakshatra: pickText(data?.nakshatra || data?.Nakshatra) || "N/A",
    yoga: pickText(data?.yoga || data?.Yoga) || "N/A",
    karan: pickText(data?.karana || data?.karan || data?.Karana || data?.Karan) || "N/A",
    sunrise: pickText(data?.sunrise) || "N/A",
    sunset: pickText(data?.sunset) || "N/A",
    rahuKaal: pickPeriod(rahuSource) || "N/A"
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = String(searchParams.get("city") || "Delhi").trim() || "Delhi";
    const date = parseDateParam(searchParams.get("date"));

    if (!date) {
      return jsonError("Date must be in YYYY-MM-DD format.", 400);
    }

    const { latitude, longitude } = resolveCoordinates(city);
    const apiResponse = await fetchProkeralaPanchang(date, latitude, longitude);
    const panchang = normalizePanchangPayload(apiResponse);

    return jsonOk({
      city,
      date,
      latitude,
      longitude,
      timezone: "Asia/Kolkata",
      ...panchang
    });
  } catch (error) {
    console.error("Panchang API error:", error);
    return jsonError("Unable to fetch real Panchang", 502);
  }
}
