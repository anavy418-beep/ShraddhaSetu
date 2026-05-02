import { jsonError, jsonOk } from "@/lib/http";
import OpenAI from "openai";

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
    defaultBaseUrl: "https://api.prokerala.com/v2",
    generatePath: "/astrology/kundli",
    authHeader: "authorization"
  },
  kundliapi: {
    defaultBaseUrl: "https://kundliapi.com/api",
    generatePath: "/planet/get_all_planet_data",
    authHeader: "x-api-key"
  }
};

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
  varanasi: { latitude: 25.3176, longitude: 82.9739 },
  ballia: { latitude: 25.7585, longitude: 84.1489 },
  patna: { latitude: 25.5941, longitude: 85.1376 },
  lucknow: { latitude: 26.8467, longitude: 80.9462 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  surat: { latitude: 21.1702, longitude: 72.8311 },
  ujjain: { latitude: 23.1765, longitude: 75.7885 },
  haridwar: { latitude: 29.9457, longitude: 78.1642 },
  gaya: { latitude: 24.7955, longitude: 85.0002 }
};

const PROKERALA_DEFAULT_TOKEN_URL = "https://api.prokerala.com/token";
const PROKERALA_DEFAULT_AYANAMSA = 1;

const prokeralaTokenCache = {
  accessToken: "",
  tokenType: "Bearer",
  expiresAt: 0
};

const KUNDLI_DISCLAIMER = "This AI Kundli is for spiritual guidance only.";

const RECOMMENDED_PUJA_MAP = {
  "Mangal Bhat Puja": "mangal-bhat-puja",
  "Pitru Dosh Shanti": "pitru-dosh-shanti",
  "Mahamrityunjay Jaap": "mahamrityunjay-jaap",
  "Navagraha Shanti Puja": "navagraha-shanti-puja",
  "Satyanarayan Puja": "satyanarayan-puja"
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

function firstText(...values) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const text = String(value).trim();
    if (text) {
      return text;
    }
  }
  return "";
}

function boolFromUnknown(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value > 0;
  }
  const text = String(value || "").toLowerCase();
  return ["yes", "true", "present", "detected", "high", "active", "manglik"].some((token) => text.includes(token));
}

function normalizeCityKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveCoordinates(birthPlace, latitude, longitude) {
  if (latitude !== null && longitude !== null) {
    return { latitude, longitude };
  }
  const cityKey = normalizeCityKey(birthPlace);
  if (cityKey && CITY_COORDINATE_MAP[cityKey]) {
    return CITY_COORDINATE_MAP[cityKey];
  }
  return DEFAULT_FALLBACK_COORDS;
}

function toDateLabel(dateValue) {
  if (!dateValue) {
    return "";
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function toProkeralaDateTime(dateOfBirth, timeOfBirth) {
  return `${dateOfBirth}T${timeOfBirth}:00+05:30`;
}

function toProkeralaLanguage(language) {
  const input = String(language || "").toLowerCase();
  if (input.startsWith("hi")) {
    return "hi";
  }
  return "en";
}

function stringHash(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

function buildRecommendedPujas(flags) {
  const suggestions = [];

  if (flags.hasMangalDosha) {
    suggestions.push({
      slug: "mangal-bhat-puja",
      title: "Mangal Bhat Puja",
      reason: "Suggested for balancing Mangal influence and improving relationship harmony."
    });
  }

  if (flags.hasPitruDosha) {
    suggestions.push({
      slug: "pitru-dosh-shanti",
      title: "Pitru Dosh Shanti",
      reason: "Suggested for ancestral peace and reducing pitru-related obstacles."
    });
  }

  if (flags.hasHealthConcern) {
    suggestions.push({
      slug: "mahamrityunjay-jaap",
      title: "Mahamrityunjay Jaap",
      reason: "Suggested for health strength, healing vibrations, and inner resilience."
    });
  }

  if (flags.hasGrahaImbalance) {
    suggestions.push({
      slug: "navagraha-shanti-puja",
      title: "Navagraha Shanti Puja",
      reason: "Suggested to harmonize planetary energies and reduce graha imbalance."
    });
  }

  if (flags.shouldAddProsperity || suggestions.length === 0) {
    suggestions.push({
      slug: "satyanarayan-puja",
      title: "Satyanarayan Puja",
      reason: "Suggested for overall prosperity, peace, and positive household energy."
    });
  }

  return suggestions;
}

function detectSignals(summaryText, mangalText, planets) {
  const mergedText = `${summaryText} ${mangalText}`.toLowerCase();
  const retrogradeCount = planets.filter((planet) => planet.retrograde).length;

  const hasMangalDosha = boolFromUnknown(mangalText) || mergedText.includes("mangal dosha") || mergedText.includes("manglik");
  const hasPitruDosha = mergedText.includes("pitru") || mergedText.includes("ancestor") || mergedText.includes("ancestral");
  const hasHealthConcern =
    mergedText.includes("health") ||
    mergedText.includes("stress") ||
    mergedText.includes("fatigue") ||
    mergedText.includes("disease") ||
    mergedText.includes("anxiety");
  const hasGrahaImbalance =
    mergedText.includes("graha") ||
    mergedText.includes("planetary imbalance") ||
    mergedText.includes("planetary") ||
    retrogradeCount >= 4;
  const shouldAddProsperity =
    mergedText.includes("prosper") ||
    mergedText.includes("wealth") ||
    mergedText.includes("growth") ||
    mergedText.includes("career") ||
    (!hasMangalDosha && !hasPitruDosha && !hasHealthConcern && !hasGrahaImbalance);

  return {
    hasMangalDosha,
    hasPitruDosha,
    hasHealthConcern,
    hasGrahaImbalance,
    shouldAddProsperity
  };
}

function normalizePlanetList(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item, index) => ({
    name: item.name || item.planet || item.planet_name || `Planet ${index + 1}`,
    sign:
      item.sign ||
      item.zodiac_sign_name ||
      item.rashi ||
      item.zodiac ||
      item.rasi?.name ||
      item.vedic_sign?.name ||
      "N/A",
    house: Number(item.house ?? item.house_number ?? item.house_no ?? item.housePosition ?? item.position ?? 0) || null,
    degree: String(item.degree ?? item.normDegree ?? item.fullDegree ?? item.longitude ?? "N/A"),
    retrograde: Boolean(
      item.isRetro ||
        item.is_retro ||
        item.retrograde ||
        item.isRetrograde ||
        String(item.retro || "").toLowerCase() === "true"
    )
  }));
}

function normalizeHouses(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item, index) => ({
    house: Number(item.house ?? item.house_number ?? item.house_no ?? index + 1) || index + 1,
    sign: item.sign || item.rashi || item.zodiac_sign || item.rasi?.name || "N/A",
    lord: item.lord || item.rashi_lord || item.house_lord || item.rasi_lord?.name || "N/A",
    occupants: Array.isArray(item.occupants) ? item.occupants.join(", ") : item.occupants || "N/A"
  }));
}

function deriveHousesFromPlanets(planets) {
  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    const occupants = planets.filter((planet) => planet.house === houseNumber).map((planet) => planet.name);
    return {
      house: houseNumber,
      sign: occupants[0] ? planets.find((planet) => planet.house === houseNumber)?.sign || "N/A" : "N/A",
      lord: "N/A",
      occupants: occupants.length ? occupants.join(", ") : "N/A"
    };
  });
}

function normalizePanchang(raw, fallbackNakshatra) {
  const panchangRaw =
    raw?.data?.panchang ||
    raw?.data?.basic_panchang ||
    raw?.responseData?.data?.[0]?.panchang ||
    raw?.panchang ||
    raw ||
    {};

  return {
    tithi: firstText(panchangRaw.tithi, raw?.tithi, panchangRaw?.tithi?.name, "Not provided"),
    nakshatra: firstText(
      panchangRaw.nakshatra,
      raw?.nakshatra,
      panchangRaw?.nakshatra?.name,
      fallbackNakshatra,
      "Not provided"
    ),
    yoga: firstText(panchangRaw.yoga, raw?.yog, raw?.yoga, panchangRaw?.yoga?.name, "Not provided"),
    karana: firstText(panchangRaw.karana, raw?.karan, raw?.karana, panchangRaw?.karana?.name, "Not provided"),
    sunrise: firstText(panchangRaw.sunrise, raw?.sunrise, "Not provided"),
    sunset: firstText(panchangRaw.sunset, raw?.sunset, "Not provided"),
    weekday: firstText(panchangRaw.weekday, raw?.weekday, "Not provided")
  };
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
  const planets = normalizePlanetList(planetsRaw);
  const houses = normalizeHouses(housesRaw);

  const rashi = firstText(astroSummary.sign, raw?.rashi, raw?.moon_sign, "Not provided");
  const nakshatra = firstText(astroSummary.nakshatra, raw?.nakshatra, "Not provided");
  const lagna = firstText(
    astroSummary.ascendant,
    astroSummary.lagna,
    raw?.lagna,
    raw?.ascendant,
    planets.find((item) => String(item?.name || "").toLowerCase() === "ascendant")?.sign,
    "Not provided"
  );

  const panchang = normalizePanchang(raw, nakshatra);
  const mangalText = firstText(
    raw?.mangal_dosha?.description,
    raw?.mangalDosha?.description,
    raw?.manglik_dosh,
    raw?.dosha?.mangal,
    "Not clearly indicated"
  );

  const prediction = firstText(
    raw?.summary,
    raw?.prediction,
    raw?.short_prediction,
    raw?.responseData?.data?.[0]?.summary,
    "Prediction summary unavailable from provider."
  );

  const signals = detectSignals(prediction, mangalText, planets);
  const remedies = [];

  if (signals.hasMangalDosha) {
    remedies.push("Observe Hanuman worship on Tuesdays and consider Mangal Bhat Puja for relationship balance.");
  }
  if (signals.hasPitruDosha) {
    remedies.push("Perform Pitru tarpan and Pitru Dosh Shanti with proper sankalp for ancestral blessings.");
  }
  if (signals.hasHealthConcern) {
    remedies.push("Practice daily Mahamrityunjay mantra jaap and maintain sattvic discipline for health support.");
  }
  if (signals.hasGrahaImbalance) {
    remedies.push("Navagraha mantra chanting and Navagraha Shanti Puja can help stabilize planetary influences.");
  }
  if (remedies.length === 0) {
    remedies.push("Regular Gayatri mantra, diya lighting, and monthly Satyanarayan Puja are advised for steady progress.");
  }

  return {
    userDetails: {
      fullName: payload.fullName,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      dateLabel: toDateLabel(payload.dateOfBirth),
      timeOfBirth: payload.timeOfBirth,
      birthPlace: payload.birthPlace,
      language: payload.language,
      latitude: payload.latitude,
      longitude: payload.longitude
    },
    panchang,
    rashi,
    nakshatra,
    lagna,
    tithi: panchang.tithi,
    yoga: panchang.yoga,
    karana: panchang.karana,
    planetPositions: planets,
    houses,
    mangalDosha: {
      status: signals.hasMangalDosha ? "Present" : "Not Significant",
      details: mangalText
    },
    pitruDosha: {
      status: signals.hasPitruDosha ? "Present" : "Not Indicated"
    },
    prediction,
    remedies,
    recommendedPujas: buildRecommendedPujas(signals)
  };
}

function normalizeProkeralaResult({ kundliData, birthDetailsData, planetData, panchangData, mangalData }, payload) {
  const kundliNakshatra = kundliData?.nakshatra_details?.nakshatra?.name;
  const rashi = firstText(
    birthDetailsData?.chandra_rasi?.name,
    kundliData?.nakshatra_details?.chandra_rasi?.name,
    kundliData?.nakshatra_details?.zodiac?.name,
    "Not provided"
  );
  const nakshatra = firstText(birthDetailsData?.nakshatra?.name, kundliNakshatra, "Not provided");

  const planets = normalizePlanetList(planetData?.planet_position || []);
  const lagnaFromPlanet = planets.find((item) => String(item.name || "").toLowerCase() === "ascendant")?.sign;
  const lagna = firstText(lagnaFromPlanet, kundliData?.lagna?.name, "Not provided");

  const panchang = normalizePanchang(panchangData, nakshatra);
  const mangalText = firstText(
    mangalData?.description,
    kundliData?.mangal_dosha?.description,
    "Not clearly indicated"
  );

  const yogaSummary = Array.isArray(kundliData?.yoga_details)
    ? kundliData.yoga_details
        .map((item) => firstText(item?.description, item?.name))
        .filter(Boolean)
        .join(" ")
    : "";

  const prediction = firstText(
    kundliData?.prediction,
    kundliData?.summary,
    yogaSummary,
    "Kundli generated successfully using Prokerala Astrology API."
  );

  const signals = detectSignals(prediction, mangalText, planets);
  const remedies = [];

  if (signals.hasMangalDosha) {
    remedies.push("Observe Hanuman worship on Tuesdays and consider Mangal Bhat Puja for relationship balance.");
  }
  if (signals.hasPitruDosha) {
    remedies.push("Perform Pitru tarpan and Pitru Dosh Shanti with proper sankalp for ancestral blessings.");
  }
  if (signals.hasHealthConcern) {
    remedies.push("Practice daily Mahamrityunjay mantra jaap and maintain sattvic discipline for health support.");
  }
  if (signals.hasGrahaImbalance) {
    remedies.push("Navagraha mantra chanting and Navagraha Shanti Puja can help stabilize planetary influences.");
  }
  if (remedies.length === 0) {
    remedies.push("Regular Gayatri mantra, diya lighting, and monthly Satyanarayan Puja are advised for steady progress.");
  }

  const houses = deriveHousesFromPlanets(planets);

  return {
    userDetails: {
      fullName: payload.fullName,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      dateLabel: toDateLabel(payload.dateOfBirth),
      timeOfBirth: payload.timeOfBirth,
      birthPlace: payload.birthPlace,
      language: payload.language,
      latitude: payload.latitude,
      longitude: payload.longitude
    },
    panchang,
    rashi,
    nakshatra,
    lagna,
    tithi: panchang.tithi,
    yoga: panchang.yoga,
    karana: panchang.karana,
    planetPositions: planets,
    houses,
    mangalDosha: {
      status: boolFromUnknown(mangalData?.has_dosha ?? kundliData?.mangal_dosha?.has_dosha) ? "Present" : "Not Significant",
      details: mangalText
    },
    pitruDosha: {
      status: signals.hasPitruDosha ? "Present" : "Not Indicated"
    },
    prediction,
    remedies,
    recommendedPujas: buildRecommendedPujas(signals)
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

function buildDemoReport(payload) {
  const fingerprint = stringHash(
    `${payload.fullName}|${payload.gender}|${payload.dateOfBirth}|${payload.timeOfBirth}|${payload.birthPlace}|${payload.language}`
  );

  const rashis = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ];

  const nakshatras = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Punarvasu",
    "Pushya",
    "Magha",
    "Hasta",
    "Swati",
    "Anuradha",
    "Revati"
  ];

  const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Panchami", "Saptami", "Dashami", "Ekadashi", "Trayodashi", "Purnima"];
  const yogas = ["Shubha", "Siddhi", "Dhriti", "Ayushman", "Harshana", "Saubhagya"];
  const karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti"];

  const rashi = rashis[fingerprint % rashis.length];
  const nakshatra = nakshatras[(fingerprint >> 2) % nakshatras.length];
  const lagna = rashis[(fingerprint >> 4) % rashis.length];
  const tithi = tithis[(fingerprint >> 1) % tithis.length];
  const yoga = yogas[(fingerprint >> 3) % yogas.length];
  const karana = karanas[(fingerprint >> 5) % karanas.length];

  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].map((name, index) => {
    const sign = rashis[(fingerprint + index * 3) % rashis.length];
    return {
      name,
      sign,
      house: ((fingerprint + index) % 12) + 1,
      degree: `${((fingerprint + index * 17) % 30).toString().padStart(2, "0")}.${((fingerprint + index * 7) % 60)
        .toString()
        .padStart(2, "0")}`,
      retrograde: index > 4 && (fingerprint + index) % 4 === 0
    };
  });

  const houses = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: rashis[(fingerprint + index) % rashis.length],
    lord: planets[(fingerprint + index) % planets.length].name,
    occupants: "N/A"
  }));

  const hasMangalDosha = fingerprint % 3 === 0;
  const hasPitruDosha = fingerprint % 5 === 0;
  const hasHealthConcern = fingerprint % 4 === 0;
  const hasGrahaImbalance = fingerprint % 2 === 0;

  const prediction =
    "Demo Kundli report based on entered birth details. This indicates good potential for steady growth through disciplined effort, with better results when spiritual routines and family harmony are maintained.";

  const signals = {
    hasMangalDosha,
    hasPitruDosha,
    hasHealthConcern,
    hasGrahaImbalance,
    shouldAddProsperity: true
  };

  const remedies = [
    "Start Thursdays with Vishnu mantra and maintain a sattvic morning routine.",
    "Offer diya and water to Surya daily for confidence and clarity.",
    "Perform monthly family sankalp puja for harmony and progress."
  ];

  if (hasMangalDosha) {
    remedies.unshift("Recite Hanuman Chalisa on Tuesdays and consider Mangal Bhat Puja.");
  }
  if (hasPitruDosha) {
    remedies.unshift("Offer Pitru tarpan on Amavasya and schedule Pitru Dosh Shanti.");
  }
  if (hasHealthConcern) {
    remedies.unshift("Add Mahamrityunjay mantra jaap for health strength and emotional calm.");
  }

  return {
    userDetails: {
      fullName: payload.fullName,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      dateLabel: toDateLabel(payload.dateOfBirth),
      timeOfBirth: payload.timeOfBirth,
      birthPlace: payload.birthPlace,
      language: payload.language,
      latitude: payload.latitude,
      longitude: payload.longitude
    },
    panchang: {
      tithi,
      nakshatra,
      yoga,
      karana,
      sunrise: "06:02 AM",
      sunset: "06:37 PM",
      weekday: new Date(payload.dateOfBirth).toLocaleDateString("en-IN", { weekday: "long" })
    },
    rashi,
    nakshatra,
    lagna,
    tithi,
    yoga,
    karana,
    planetPositions: planets,
    houses,
    mangalDosha: {
      status: hasMangalDosha ? "Present" : "Not Significant",
      details: hasMangalDosha
        ? "Demo signal shows Mangal influence in key houses. Consider corrective puja guidance."
        : "No major Mangal affliction observed in demo profile."
    },
    pitruDosha: {
      status: hasPitruDosha ? "Present" : "Not Indicated"
    },
    prediction,
    remedies,
    recommendedPujas: buildRecommendedPujas(signals)
  };
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureDisclaimer(prediction) {
  const text = firstText(prediction, "Prediction is not available at the moment.");
  return text.includes(KUNDLI_DISCLAIMER) ? text : `${text}\n\n${KUNDLI_DISCLAIMER}`;
}

function toPublicKundliResponse(mode, report, warning = "") {
  return {
    mode,
    ...(warning ? { warning } : {}),
    ...report
  };
}

function mergeHybridKundli(baseReport, aiOverlay) {
  const base = baseReport || {};
  const overlay = aiOverlay || {};

  const mergedMangalSummary = firstText(overlay.doshaExplanation, base?.mangalDosha?.details, "Not clearly indicated.");
  const mergedPrediction = ensureDisclaimer(firstText(overlay.prediction, base?.prediction));

  return {
    ...base,
    prediction: mergedPrediction,
    remedies: ensureArray(overlay.remedies).length ? ensureArray(overlay.remedies) : ensureArray(base.remedies),
    mangalDosha: {
      ...(base.mangalDosha || {}),
      details: mergedMangalSummary,
      summary: mergedMangalSummary
    },
    recommendedPujas: normalizeRecommendedPujas(overlay.recommendedPujas, base.recommendedPujas)
  };
}

function normalizeRecommendedPujas(value, fallbackList) {
  const raw = ensureArray(value);
  if (raw.length === 0) {
    return ensureArray(fallbackList);
  }

  const normalized = raw
    .map((item) => {
      if (!item) {
        return null;
      }

      if (typeof item === "string") {
        const title = item.trim();
        if (!title) {
          return null;
        }
        return {
          slug: RECOMMENDED_PUJA_MAP[title] || "",
          title,
          reason: "Suggested based on AI interpretation."
        };
      }

      const title = firstText(item.title, item.name);
      if (!title) {
        return null;
      }
      return {
        slug: firstText(item.slug, RECOMMENDED_PUJA_MAP[title]),
        title,
        reason: firstText(item.reason, "Suggested based on AI interpretation.")
      };
    })
    .filter(Boolean)
    .map((item) => ({
      ...item,
      slug: item.slug || RECOMMENDED_PUJA_MAP[item.title] || ""
    }))
    .filter((item) => item.slug);

  return normalized.length ? normalized : ensureArray(fallbackList);
}

function normalizeAiPlanetPositions(value, fallbackPlanets) {
  const raw = ensureArray(value);
  if (raw.length === 0) {
    return ensureArray(fallbackPlanets);
  }
  return raw.map((item, index) => ({
    name: firstText(item?.name, `Planet ${index + 1}`),
    sign: firstText(item?.sign, "N/A"),
    house: Number(item?.house) || null,
    degree: firstText(item?.degree, "N/A"),
    retrograde: boolFromUnknown(item?.retrograde)
  }));
}

function normalizeAiHouses(value, fallbackHouses) {
  const raw = ensureArray(value);
  if (raw.length === 0) {
    return ensureArray(fallbackHouses);
  }
  return raw.map((item, index) => ({
    house: Number(item?.house) || index + 1,
    sign: firstText(item?.sign, "N/A"),
    lord: firstText(item?.lord, "N/A"),
    occupants: firstText(item?.occupants, "N/A")
  }));
}

function normalizeAiKundliReport(aiReport, payload, baseResult, hasRealAstroData) {
  const safeAi = aiReport || {};
  const base = baseResult || buildDemoReport(payload);
  const aiPanchang = safeAi.panchang || {};
  const basePanchang = base.panchang || {};

  const panchang = {
    tithi: firstText(aiPanchang.tithi, basePanchang.tithi, "Not provided"),
    nakshatra: firstText(aiPanchang.nakshatra, basePanchang.nakshatra, "Not provided"),
    yoga: firstText(aiPanchang.yoga, basePanchang.yoga, "Not provided"),
    karana: firstText(aiPanchang.karana, basePanchang.karana, "Not provided"),
    sunrise: firstText(aiPanchang.sunrise, basePanchang.sunrise, "Not provided"),
    sunset: firstText(aiPanchang.sunset, basePanchang.sunset, "Not provided")
  };

  const mangalPresent = boolFromUnknown(safeAi?.mangalDosha?.present ?? base?.mangalDosha?.status);
  const mangalSummary = firstText(safeAi?.mangalDosha?.summary, base?.mangalDosha?.details, "Not clearly indicated.");

  const prediction = ensureDisclaimer(
    firstText(
      safeAi?.prediction,
      base?.prediction,
      hasRealAstroData
        ? "The chart indicates opportunities for growth with balanced discipline and spiritual focus."
        : "This guidance is generated from available details and should be considered as spiritual insight."
    )
  );

  return {
    userDetails: {
      ...(base.userDetails || {}),
      ...(safeAi.userDetails || {}),
      fullName: payload.fullName,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      dateLabel: toDateLabel(payload.dateOfBirth),
      timeOfBirth: payload.timeOfBirth,
      birthPlace: payload.birthPlace,
      language: payload.language,
      latitude: payload.latitude,
      longitude: payload.longitude
    },
    panchang,
    rashi: firstText(safeAi.rashi, base.rashi, "Not provided"),
    nakshatra: firstText(safeAi.nakshatra, base.nakshatra, panchang.nakshatra, "Not provided"),
    lagna: firstText(safeAi.lagna, base.lagna, "Not provided"),
    tithi: panchang.tithi,
    yoga: panchang.yoga,
    karana: panchang.karana,
    planetPositions: normalizeAiPlanetPositions(safeAi.planetPositions, base.planetPositions),
    houses: normalizeAiHouses(safeAi.houses, base.houses),
    mangalDosha: {
      present: mangalPresent,
      summary: mangalSummary,
      status: mangalPresent ? "Present" : "Not Significant",
      details: mangalSummary
    },
    prediction,
    remedies: ensureArray(safeAi.remedies).length ? ensureArray(safeAi.remedies) : ensureArray(base.remedies),
    recommendedPujas: normalizeRecommendedPujas(safeAi.recommendedPujas, base.recommendedPujas)
  };
}

function getOpenAiResponseText(response) {
  if (response?.output_text && typeof response.output_text === "string") {
    return response.output_text;
  }

  const textParts = [];
  const outputs = ensureArray(response?.output);
  for (const output of outputs) {
    const content = ensureArray(output?.content);
    for (const part of content) {
      if (typeof part?.text === "string") {
        textParts.push(part.text);
      } else if (typeof part?.json === "string") {
        textParts.push(part.json);
      }
    }
  }
  return textParts.join("\n").trim();
}

async function callOpenAiKundli(payload, baseReport, hasRealAstroData) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return null;
  }

  const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim() || "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  const languageInstruction = payload.language.toLowerCase().startsWith("hi")
    ? "Respond entirely in Hindi."
    : "Respond entirely in English.";

  const systemPrompt =
    "You are a respectful Vedic astrology guide. Return JSON only without markdown. " +
    "Use the supplied kundli calculation values. Generate only interpretation and guidance text.";

  const userPrompt = [
    "Based on the following kundli data, generate a professional Vedic astrology report JSON with prediction, remedies, dosha explanation and puja suggestions.",
    languageInstruction,
    hasRealAstroData
      ? "Base astrology data is from configured calculation APIs."
      : "Base astrology data is estimated/demo. Avoid claiming exact mathematical certainty.",
    "Include this exact disclaimer sentence inside prediction text: This AI Kundli is for spiritual guidance only.",
    "Do not mention API names, backend, tokens, or internal logic.",
    "",
    `User name: ${payload.fullName}`,
    `Gender: ${payload.gender}`,
    `DOB: ${payload.dateOfBirth}`,
    `TOB: ${payload.timeOfBirth}`,
    `Birth place: ${payload.birthPlace}`,
    `Language: ${payload.language}`,
    "",
    "",
    "Calculated Kundli Data:",
    `Rashi: ${firstText(baseReport?.rashi, "Not available")}`,
    `Nakshatra: ${firstText(baseReport?.nakshatra, "Not available")}`,
    `Lagna: ${firstText(baseReport?.lagna, "Not available")}`,
    `Panchang: ${JSON.stringify(baseReport?.panchang || {})}`,
    `Planet Positions: ${JSON.stringify(baseReport?.planetPositions || [])}`,
    `Mangal Dosha: ${JSON.stringify(baseReport?.mangalDosha || {})}`,
    `Recommended base pujas: ${JSON.stringify(baseReport?.recommendedPujas || [])}`
  ].join("\n");

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
      { role: "user", content: [{ type: "input_text", text: userPrompt }] }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "kundli_explanation",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            prediction: { type: "string" },
            doshaExplanation: { type: "string" },
            remedies: { type: "array", items: { type: "string" } },
            recommendedPujas: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  slug: { type: "string" },
                  title: { type: "string" },
                  reason: { type: "string" }
                },
                required: ["slug", "title", "reason"]
              }
            }
          },
          required: [
            "prediction",
            "doshaExplanation",
            "remedies",
            "recommendedPujas"
          ]
        }
      }
    }
  });

  const rawText = getOpenAiResponseText(response);
  if (!rawText) {
    throw new Error("OpenAI did not return JSON content.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("OpenAI response was not valid JSON.");
  }

  return {
    prediction: ensureDisclaimer(firstText(parsed?.prediction, baseReport?.prediction)),
    doshaExplanation: firstText(parsed?.doshaExplanation, baseReport?.mangalDosha?.details),
    remedies: ensureArray(parsed?.remedies),
    recommendedPujas: normalizeRecommendedPujas(parsed?.recommendedPujas, baseReport?.recommendedPujas)
  };
}

function toDemo(provider, payload, warning) {
  return {
    mode: "demo",
    provider,
    warning,
    result: buildDemoReport(payload)
  };
}

async function getProkeralaAccessToken() {
  const clientId = (process.env.PROKERALA_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PROKERALA_CLIENT_SECRET || "").trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  if (prokeralaTokenCache.accessToken && Date.now() < prokeralaTokenCache.expiresAt - 60_000) {
    return `${prokeralaTokenCache.tokenType} ${prokeralaTokenCache.accessToken}`;
  }

  const tokenUrl = (process.env.PROKERALA_TOKEN_URL || PROKERALA_DEFAULT_TOKEN_URL).trim();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Prokerala token request failed (${response.status}): ${errorBody.slice(0, 180)}`);
  }

  const tokenData = await response.json();
  const accessToken = tokenData?.access_token;
  if (!accessToken) {
    throw new Error("Prokerala token response did not include access_token.");
  }

  const expiresInSeconds = Number(tokenData?.expires_in || 3600);
  prokeralaTokenCache.accessToken = accessToken;
  prokeralaTokenCache.tokenType = tokenData?.token_type || "Bearer";
  prokeralaTokenCache.expiresAt = Date.now() + expiresInSeconds * 1000;

  return `${prokeralaTokenCache.tokenType} ${prokeralaTokenCache.accessToken}`;
}

async function callProkeralaEndpoint(baseUrl, endpointPath, authHeader, queryParams) {
  const url = new URL(endpointPath, `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Prokerala API ${endpointPath} failed (${response.status}): ${errorBody.slice(0, 180)}`);
  }

  const raw = await response.json();
  if (raw?.status && String(raw.status).toLowerCase() !== "ok") {
    throw new Error(`Prokerala API ${endpointPath} returned non-ok status.`);
  }
  return raw;
}

async function callProkeralaProvider(payload) {
  const authHeader = await getProkeralaAccessToken();
  if (!authHeader) {
    return null;
  }

  const baseUrl = (process.env.KUNDLI_API_BASE_URL || SUPPORTED_PROVIDERS.prokerala.defaultBaseUrl).trim();
  const datetime = toProkeralaDateTime(payload.dateOfBirth, payload.timeOfBirth);
  const coordinates = `${payload.latitude},${payload.longitude}`;
  const la = toProkeralaLanguage(payload.language);
  const ayanamsa = parseNumeric(process.env.PROKERALA_AYANAMSA) ?? PROKERALA_DEFAULT_AYANAMSA;

  const params = {
    ayanamsa,
    coordinates,
    datetime,
    la
  };

  const [kundliRaw, birthDetailsRaw, planetRaw, panchangRaw, mangalRaw] = await Promise.all([
    callProkeralaEndpoint(baseUrl, "/astrology/kundli", authHeader, params),
    callProkeralaEndpoint(baseUrl, "/astrology/birth-details", authHeader, params),
    callProkeralaEndpoint(baseUrl, "/astrology/planet-position", authHeader, params),
    callProkeralaEndpoint(baseUrl, "/astrology/panchang", authHeader, params),
    callProkeralaEndpoint(baseUrl, "/astrology/mangal-dosha", authHeader, params)
  ]);

  return normalizeProkeralaResult(
    {
      kundliData: kundliRaw?.data,
      birthDetailsData: birthDetailsRaw?.data,
      planetData: planetRaw?.data,
      panchangData: panchangRaw?.data,
      mangalData: mangalRaw?.data
    },
    payload
  );
}

async function callProvider(providerName, payload) {
  if (providerName === "prokerala") {
    const prokeralaResult = await callProkeralaProvider(payload);
    if (!prokeralaResult) {
      return toDemo(providerName, payload, "Prokerala credentials are missing. Showing professional demo Kundli report.");
    }

    return {
      mode: "real",
      provider: providerName,
      result: prokeralaResult
    };
  }

  const provider = SUPPORTED_PROVIDERS[providerName] || SUPPORTED_PROVIDERS.freeastrologyapi;
  const apiKey = process.env.KUNDLI_API_KEY || "";
  const configuredBaseUrl = (process.env.KUNDLI_API_BASE_URL || "").trim();
  const baseUrl = configuredBaseUrl || provider.defaultBaseUrl;

  if (!apiKey || !baseUrl) {
    return toDemo(providerName, payload, "Kundli API key is not configured. Showing professional demo Kundli report.");
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
    mode: "real",
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
    return { error: "Resolved coordinates are out of range." };
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

    const aiProvider = (process.env.KUNDLI_AI_PROVIDER || "openai").toLowerCase();

    let prokeralaReport = null;
    try {
      prokeralaReport = await callProkeralaProvider(parsed.value);
    } catch (providerError) {
      console.error(providerError);
    }

    if (!prokeralaReport) {
      const demoReport = buildDemoReport(parsed.value);
      return jsonOk(
        toPublicKundliResponse(
          "demo",
          demoReport,
          "Prokerala calculation is unavailable. Showing professional demo Kundli report."
        )
      );
    }

    if (aiProvider !== "openai") {
      return jsonOk(toPublicKundliResponse("real", prokeralaReport));
    }

    try {
      const aiOverlay = await callOpenAiKundli(parsed.value, prokeralaReport, true);
      if (!aiOverlay) {
        return jsonOk(
          toPublicKundliResponse(
            "real",
            prokeralaReport,
            "OPENAI_API_KEY is missing. Showing real Prokerala Kundli data without AI explanation."
          )
        );
      }

      const hybridReport = mergeHybridKundli(prokeralaReport, aiOverlay);
      return jsonOk(toPublicKundliResponse("hybrid", hybridReport));
    } catch (openAiError) {
      console.error(openAiError);
      return jsonOk(
        toPublicKundliResponse(
          "real",
          prokeralaReport,
          "AI explanation is temporarily unavailable. Showing real Prokerala Kundli data."
        )
      );
    }
  } catch (error) {
    console.error(error);
    return jsonError("Unable to generate kundli right now.", 500);
  }
}
