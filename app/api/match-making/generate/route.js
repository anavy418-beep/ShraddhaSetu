import { jsonError, jsonOk } from "@/lib/http";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const DEMO_DISCLAIMER = "This AI compatibility report is for spiritual guidance only.";

const MATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    mode: { type: "string" },
    score: { type: "number" },
    gunaScore: { type: "string" },
    compatibilityLevel: { type: "string" },
    summary: { type: "string" },
    manglikStatus: {
      type: "object",
      additionalProperties: false,
      properties: {
        boy: { type: "string" },
        girl: { type: "string" },
        result: { type: "string" }
      },
      required: ["boy", "girl", "result"]
    },
    doshaSummary: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    marriageAdvice: { type: "string" }
  },
  required: [
    "mode",
    "score",
    "gunaScore",
    "compatibilityLevel",
    "summary",
    "manglikStatus",
    "doshaSummary",
    "strengths",
    "concerns",
    "recommendations",
    "marriageAdvice"
  ]
};

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

function parsePerson(person) {
  if (!person || typeof person !== "object") {
    return null;
  }

  const name = firstText(person.name);
  const dateOfBirth = firstText(person.dateOfBirth);
  const timeOfBirth = firstText(person.timeOfBirth);
  const birthPlace = firstText(person.birthPlace);
  const latitude = parseNumeric(person.latitude);
  const longitude = parseNumeric(person.longitude);

  if (!name || !dateOfBirth || !timeOfBirth || !birthPlace) {
    return null;
  }

  if (!/^(\d{4})-(\d{2})-(\d{2})$/.test(dateOfBirth)) {
    return null;
  }
  if (!/^(\d{2}):(\d{2})$/.test(timeOfBirth)) {
    return null;
  }

  return {
    name,
    dateOfBirth,
    timeOfBirth,
    birthPlace,
    latitude,
    longitude
  };
}

function stringHash(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

function buildDemoCompatibility(boy, girl) {
  const seed = stringHash(
    `${boy.name}|${boy.dateOfBirth}|${boy.timeOfBirth}|${boy.birthPlace}|${girl.name}|${girl.dateOfBirth}|${girl.timeOfBirth}|${girl.birthPlace}`
  );

  const score = 58 + (seed % 35);
  const level = score >= 80 ? "Excellent" : score >= 68 ? "Good" : score >= 55 ? "Moderate" : "Needs Guidance";
  const boyManglik = seed % 3 === 0 ? "Mild Manglik indications" : "No strong Manglik indication";
  const girlManglik = seed % 5 === 0 ? "Mild Manglik indications" : "No strong Manglik indication";

  return {
    mode: "demo",
    score,
    gunaScore: `${Math.round((score / 100) * 36)}/36`,
    compatibilityLevel: level,
    summary:
      "This demo compatibility overview suggests practical harmony with areas that benefit from communication, family alignment, and shared spiritual routines.",
    manglikStatus: {
      boy: boyManglik,
      girl: girlManglik,
      result:
        boyManglik.includes("Mild") || girlManglik.includes("Mild")
          ? "Mild Manglik balancing may be considered."
          : "No major Manglik conflict indicated in demo analysis."
    },
    doshaSummary: [
      "Minor emotional rhythm mismatch may appear during stressful periods.",
      "Family expectation alignment should be discussed before major commitments."
    ],
    strengths: [
      "Good emotional support potential between both charts.",
      "Shared values around family and long-term stability.",
      "Compatible communication style with maturity."
    ],
    concerns: [
      "Decision speed mismatch can create temporary friction.",
      "Career timing priorities may need explicit planning."
    ],
    recommendations: [
      "Hold one focused family discussion before final commitment.",
      "Set shared financial and career expectations early.",
      "Perform a joint Satyanarayan Puja for harmony and blessings."
    ],
    marriageAdvice:
      `Overall match appears ${level.toLowerCase()} in this AI demo assessment. Proceed with mindful communication and traditional guidance. ${DEMO_DISCLAIMER}`
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

function normalizeAiResult(raw) {
  return {
    mode: "ai",
    score: Number(raw?.score) || 0,
    gunaScore: firstText(raw?.gunaScore, "0/36"),
    compatibilityLevel: firstText(raw?.compatibilityLevel, "Moderate"),
    summary: firstText(raw?.summary, "Compatibility summary not available."),
    manglikStatus: {
      boy: firstText(raw?.manglikStatus?.boy, "Not specified"),
      girl: firstText(raw?.manglikStatus?.girl, "Not specified"),
      result: firstText(raw?.manglikStatus?.result, "Not specified")
    },
    doshaSummary: Array.isArray(raw?.doshaSummary) ? raw.doshaSummary : [],
    strengths: Array.isArray(raw?.strengths) ? raw.strengths : [],
    concerns: Array.isArray(raw?.concerns) ? raw.concerns : [],
    recommendations: Array.isArray(raw?.recommendations) ? raw.recommendations : [],
    marriageAdvice: firstText(raw?.marriageAdvice, DEMO_DISCLAIMER)
  };
}

async function callOpenAiCompatibility(boy, girl) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return null;
  }

  const model = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim() || "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  const prompt = [
    "Generate an AI-assisted Vedic match-making compatibility report.",
    "This is spiritual guidance and should not claim guaranteed mathematical astrology certainty.",
    "Return JSON only in the provided schema.",
    "",
    "Boy Details:",
    JSON.stringify(boy),
    "",
    "Girl Details:",
    JSON.stringify(girl),
    "",
    `Include this spirit in marriageAdvice: ${DEMO_DISCLAIMER}`
  ].join("\n");

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are a respectful Vedic compatibility guide. Output valid JSON strictly matching schema."
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
        name: "match_making_report",
        strict: true,
        schema: MATCH_SCHEMA
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

  return normalizeAiResult(parsed);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const boy = parsePerson(body?.boy);
    const girl = parsePerson(body?.girl);

    if (!boy || !girl) {
      return jsonError("Valid boy and girl birth details are required.", 400);
    }

    const hasOpenAiKey = Boolean((process.env.OPENAI_API_KEY || "").trim());
    if (!hasOpenAiKey) {
      return jsonOk({
        ...buildDemoCompatibility(boy, girl),
        warningReason: "missing_openai_key"
      });
    }

    try {
      const aiResult = await callOpenAiCompatibility(boy, girl);
      if (!aiResult) {
        return jsonOk({
          ...buildDemoCompatibility(boy, girl),
          warningReason: "missing_openai_key"
        });
      }
      return jsonOk(aiResult);
    } catch (error) {
      console.error(error);
      return jsonOk({
        ...buildDemoCompatibility(boy, girl),
        warningReason: "openai_error"
      });
    }
  } catch (error) {
    console.error(error);
    return jsonError("Unable to generate compatibility report right now.", 500);
  }
}
