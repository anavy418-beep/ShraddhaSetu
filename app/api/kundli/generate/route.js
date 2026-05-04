import { jsonError, jsonOk } from "@/lib/http";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const KUNDLI_DISCLAIMER =
  "This AI Kundli is for spiritual guidance only and should not be treated as a guaranteed astrological calculation.";

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

const AI_KUNDLI_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    mode: { type: "string" },
    userDetails: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        gender: { type: "string" },
        dateOfBirth: { type: "string" },
        timeOfBirth: { type: "string" },
        birthPlace: { type: "string" }
      },
      required: ["name", "gender", "dateOfBirth", "timeOfBirth", "birthPlace"]
    },
    panchang: {
      type: "object",
      additionalProperties: false,
      properties: {
        tithi: { type: "string" },
        nakshatra: { type: "string" },
        yoga: { type: "string" },
        karana: { type: "string" },
        sunrise: { type: "string" },
        sunset: { type: "string" }
      },
      required: ["tithi", "nakshatra", "yoga", "karana", "sunrise", "sunset"]
    },
    rashi: { type: "string" },
    lagna: { type: "string" },
    planetPositions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          planet: { type: "string" },
          sign: { type: "string" },
          house: { type: "string" },
          degree: { type: "string" },
          meaning: { type: "string" }
        },
        required: ["planet", "sign", "house", "degree", "meaning"]
      }
    },
    houses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          house: { type: "number" },
          sign: { type: "string" },
          meaning: { type: "string" }
        },
        required: ["house", "sign", "meaning"]
      }
    },
    mangalDosha: {
      type: "object",
      additionalProperties: false,
      properties: {
        present: { type: "boolean" },
        level: { type: "string" },
        summary: { type: "string" }
      },
      required: ["present", "level", "summary"]
    },
    prediction: {
      type: "object",
      additionalProperties: false,
      properties: {
        personality: { type: "string" },
        career: { type: "string" },
        finance: { type: "string" },
        marriage: { type: "string" },
        health: { type: "string" },
        spiritual: { type: "string" }
      },
      required: ["personality", "career", "finance", "marriage", "health", "spiritual"]
    },
    remedies: {
      type: "array",
      items: { type: "string" }
    },
    recommendedPujas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          reason: { type: "string" },
          slug: { type: "string" }
        },
        required: ["name", "reason", "slug"]
      }
    },
    disclaimer: { type: "string" }
  },
  required: [
    "mode",
    "userDetails",
    "panchang",
    "rashi",
    "lagna",
    "planetPositions",
    "houses",
    "mangalDosha",
    "prediction",
    "remedies",
    "recommendedPujas",
    "disclaimer"
  ]
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

function toPublicKundliResponse(mode, report, warning = "", warningReason = "") {
  const kundli = report?.kundli || report || {};
  const planets = Array.isArray(report?.planets)
    ? report.planets
    : Array.isArray(kundli?.planetPositions)
      ? kundli.planetPositions
      : [];
  const chart = Array.isArray(report?.chart)
    ? report.chart
    : Array.isArray(kundli?.houses)
      ? kundli.houses
      : [];

  return {
    mode,
    kundli,
    planets,
    chart,
    ...(warning ? { warning } : {}),
    ...(warningReason ? { warningReason } : {}),
    ...kundli
  };
}

function stringHash(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
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

  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"];

  return {
    mode: "demo",
    userDetails: {
      fullName: payload.fullName,
      name: payload.fullName,
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
      tithi: tithis[(fingerprint >> 1) % tithis.length],
      nakshatra,
      yoga: yogas[(fingerprint >> 3) % yogas.length],
      karana: karanas[(fingerprint >> 5) % karanas.length],
      sunrise: "06:05 AM",
      sunset: "06:32 PM"
    },
    rashi,
    nakshatra,
    lagna,
    tithi: tithis[(fingerprint >> 1) % tithis.length],
    yoga: yogas[(fingerprint >> 3) % yogas.length],
    karana: karanas[(fingerprint >> 5) % karanas.length],
    planetPositions: planetNames.map((planet, index) => ({
      planet,
      name: planet,
      sign: rashis[(fingerprint + index * 3) % rashis.length],
      house: String(((fingerprint + index) % 12) + 1),
      degree: `${((fingerprint + index * 11) % 30).toString().padStart(2, "0")}.${((fingerprint + index * 7) % 60)
        .toString()
        .padStart(2, "0")}`,
      meaning: `${planet} indicates focus in ${rashis[(fingerprint + index * 3) % rashis.length]} energies.`
    })),
    houses: Array.from({ length: 12 }, (_, index) => ({
      house: index + 1,
      sign: rashis[(fingerprint + index) % rashis.length],
      meaning: `House ${index + 1} highlights growth through disciplined actions and spiritual balance.`
    })),
    mangalDosha: {
      present: fingerprint % 3 === 0,
      level: fingerprint % 3 === 0 ? "Moderate" : "Low",
      summary:
        fingerprint % 3 === 0
          ? "Mangal influence appears moderately active in this AI interpretation."
          : "No major Mangal concern is indicated in this AI interpretation.",
      status: fingerprint % 3 === 0 ? "Present" : "Not Significant",
      details:
        fingerprint % 3 === 0
          ? "Mangal influence appears moderately active in this AI interpretation."
          : "No major Mangal concern is indicated in this AI interpretation."
    },
    prediction: {
      personality: "You are intuitive, practical, and spiritually inclined.",
      career: "Consistent effort and skill-building bring stable career growth.",
      finance: "Balanced planning and controlled spending improve long-term savings.",
      marriage: "Communication and patience strengthen relationship harmony.",
      health: "Daily routine, hydration, and mantra meditation support wellness.",
      spiritual: "Regular prayer and sattvic habits increase clarity and peace."
    },
    remedies: [
      "Chant Gayatri mantra daily with focus.",
      "Offer diya at sunrise on Sundays.",
      "Do monthly Satyanarayan puja for household harmony."
    ],
    recommendedPujas: [
      {
        name: "Satyanarayan Puja",
        reason: "For prosperity, peace, and spiritual stability.",
        slug: "satyanarayan-puja"
      }
    ],
    disclaimer: KUNDLI_DISCLAIMER
  };
}

function getOpenAiResponseText(response) {
  if (response?.output_text && typeof response.output_text === "string") {
    return response.output_text;
  }

  const outputs = Array.isArray(response?.output) ? response.output : [];
  const texts = [];
  for (const output of outputs) {
    const content = Array.isArray(output?.content) ? output.content : [];
    for (const part of content) {
      if (typeof part?.text === "string") {
        texts.push(part.text);
      }
    }
  }

  return texts.join("\n").trim();
}

function normalizeAiReport(aiReport, payload) {
  const report = aiReport || {};

  const userDetails = report.userDetails || {};
  const planetPositions = Array.isArray(report.planetPositions) ? report.planetPositions : [];
  const houses = Array.isArray(report.houses) ? report.houses : [];
  const remedies = Array.isArray(report.remedies) ? report.remedies : [];
  const recommendedPujas = Array.isArray(report.recommendedPujas) ? report.recommendedPujas : [];

  const predictionObj = report.prediction || {};
  const predictionText = [
    `Personality: ${firstText(predictionObj.personality, "Not provided")}`,
    `Career: ${firstText(predictionObj.career, "Not provided")}`,
    `Finance: ${firstText(predictionObj.finance, "Not provided")}`,
    `Marriage: ${firstText(predictionObj.marriage, "Not provided")}`,
    `Health: ${firstText(predictionObj.health, "Not provided")}`,
    `Spiritual: ${firstText(predictionObj.spiritual, "Not provided")}`
  ].join("\n");

  const mangalSummary = firstText(report?.mangalDosha?.summary, "Not provided");
  const mangalPresent = Boolean(report?.mangalDosha?.present);

  return {
    mode: "ai",
    userDetails: {
      fullName: firstText(userDetails.name, payload.fullName),
      name: firstText(userDetails.name, payload.fullName),
      gender: firstText(userDetails.gender, payload.gender),
      dateOfBirth: firstText(userDetails.dateOfBirth, payload.dateOfBirth),
      dateLabel: toDateLabel(payload.dateOfBirth),
      timeOfBirth: firstText(userDetails.timeOfBirth, payload.timeOfBirth),
      birthPlace: firstText(userDetails.birthPlace, payload.birthPlace),
      language: payload.language,
      latitude: payload.latitude,
      longitude: payload.longitude
    },
    panchang: {
      tithi: firstText(report?.panchang?.tithi, "Not provided"),
      nakshatra: firstText(report?.panchang?.nakshatra, "Not provided"),
      yoga: firstText(report?.panchang?.yoga, "Not provided"),
      karana: firstText(report?.panchang?.karana, "Not provided"),
      sunrise: firstText(report?.panchang?.sunrise, "Not provided"),
      sunset: firstText(report?.panchang?.sunset, "Not provided")
    },
    rashi: firstText(report?.rashi, "Not provided"),
    nakshatra: firstText(report?.panchang?.nakshatra, "Not provided"),
    lagna: firstText(report?.lagna, "Not provided"),
    tithi: firstText(report?.panchang?.tithi, "Not provided"),
    yoga: firstText(report?.panchang?.yoga, "Not provided"),
    karana: firstText(report?.panchang?.karana, "Not provided"),
    planetPositions: planetPositions.map((item, index) => ({
      planet: firstText(item?.planet, `Planet ${index + 1}`),
      name: firstText(item?.planet, `Planet ${index + 1}`),
      sign: firstText(item?.sign, "Not provided"),
      house: firstText(item?.house, "Not provided"),
      degree: firstText(item?.degree, "Not provided"),
      meaning: firstText(item?.meaning, "Not provided")
    })),
    houses: houses.map((item, index) => ({
      house: Number(item?.house) || index + 1,
      sign: firstText(item?.sign, "Not provided"),
      meaning: firstText(item?.meaning, "Not provided"),
      lord: "N/A",
      occupants: "N/A"
    })),
    mangalDosha: {
      present: mangalPresent,
      level: firstText(report?.mangalDosha?.level, mangalPresent ? "Moderate" : "Low"),
      summary: mangalSummary,
      status: mangalPresent ? "Present" : "Not Significant",
      details: mangalSummary
    },
    prediction: predictionText,
    predictionSections: {
      personality: firstText(predictionObj.personality, "Not provided"),
      career: firstText(predictionObj.career, "Not provided"),
      finance: firstText(predictionObj.finance, "Not provided"),
      marriage: firstText(predictionObj.marriage, "Not provided"),
      health: firstText(predictionObj.health, "Not provided"),
      spiritual: firstText(predictionObj.spiritual, "Not provided")
    },
    remedies,
    recommendedPujas: recommendedPujas.map((item) => ({
      name: firstText(item?.name, "Recommended Puja"),
      title: firstText(item?.name, "Recommended Puja"),
      reason: firstText(item?.reason, "Suggested by AI Kundli interpretation."),
      slug: firstText(item?.slug, "satyanarayan-puja")
    })),
    disclaimer: firstText(report?.disclaimer, KUNDLI_DISCLAIMER)
  };
}

async function callOpenAiKundli(payload) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return null;
  }

  const client = new OpenAI({ apiKey });
  const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim() || "gpt-4o-mini";

  const languageInstruction = payload.language.toLowerCase().startsWith("hi")
    ? "Return the report in Hindi."
    : "Return the report in English.";

  const prompt = [
    "Generate a professional AI Kundli report.",
    "This is AI-generated spiritual guidance, not a mathematically guaranteed astrological calculation.",
    "Return JSON only in the required schema. Do not add markdown or extra text.",
    languageInstruction,
    "If precise astronomical values are uncertain, provide spiritually reasonable values and clearly keep tone non-absolute.",
    `Name: ${payload.fullName}`,
    `Gender: ${payload.gender}`,
    `Date of Birth: ${payload.dateOfBirth}`,
    `Time of Birth: ${payload.timeOfBirth}`,
    `Birth Place: ${payload.birthPlace}`,
    `Latitude: ${payload.latitude}`,
    `Longitude: ${payload.longitude}`,
    `Language: ${payload.language}`,
    `Disclaimer must be exactly: ${KUNDLI_DISCLAIMER}`
  ].join("\n");

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are a respectful Vedic spiritual guide. Output strictly valid JSON following the provided schema."
          }
        ]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "ai_kundli_report",
        strict: true,
        schema: AI_KUNDLI_SCHEMA
      }
    }
  });

  const rawText = getOpenAiResponseText(response);
  if (!rawText) {
    throw new Error("OpenAI returned empty response.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  return normalizeAiReport(parsed, payload);
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

    const hasOpenAiKey = Boolean((process.env.OPENAI_API_KEY || "").trim());
    if (!hasOpenAiKey) {
      return jsonOk(
        toPublicKundliResponse(
          "demo",
          buildDemoReport(parsed.value),
          "AI Kundli generation is temporarily unavailable. Showing demo Kundli report.",
          "missing_openai_key"
        )
      );
    }

    try {
      const aiReport = await callOpenAiKundli(parsed.value);
      if (!aiReport) {
        return jsonOk(
          toPublicKundliResponse(
            "demo",
            buildDemoReport(parsed.value),
            "AI Kundli generation is temporarily unavailable. Showing demo Kundli report.",
            "missing_openai_key"
          )
        );
      }

      return jsonOk(toPublicKundliResponse("ai", aiReport));
    } catch (openAiError) {
      console.error(openAiError);
      return jsonOk(
        toPublicKundliResponse(
          "demo",
          buildDemoReport(parsed.value),
          "AI Kundli generation is temporarily unavailable. Showing demo Kundli report.",
          "openai_error"
        )
      );
    }
  } catch (error) {
    console.error(error);
    return jsonError("Unable to generate kundli right now.", 500);
  }
}
