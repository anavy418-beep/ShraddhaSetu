import fs from "node:fs";
import path from "node:path";

const FALLBACK_CITY_IMAGE = "/images/cities/default-temple.jpg";
const CITY_IMAGE_DIR = path.join(process.cwd(), "public", "images", "cities");
const TEMPLE_IMAGE_DIR = path.join(CITY_IMAGE_DIR, "temples");
const TEMPLE_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".avif", ".png"];

export const templeImageMap = {
  delhi: "akshardham-temple-delhi",
  faridabad: "iskcon-temple-faridabad",
  ghaziabad: "iskcon-temple-ghaziabad",
  gaya: "vishnupad-temple-gaya",
  varanasi: "kashi-vishwanath-temple",
  mumbai: "siddhivinayak-temple",
  jaipur: "birla-mandir-jaipur",
  kolkata: "kalighat-temple",
  patna: "mahabodhi-temple",
  haridwar: "har-ki-pauri",
  rishikesh: "neelkanth-mahadev",
  lucknow: "hanuman-setu-temple",
  kanpur: "jk-temple-kanpur",
  indore: "khajrana-ganesh-temple",
  surat: "ambika-niketan-temple",
  nagpur: "tekdi-ganesh-temple",
  pune: "dagdusheth-ganpati",
  hyderabad: "birla-mandir-hyderabad"
};

const DEFAULT_POPULAR_PUJAS = ["Satyanarayan Puja", "Rudrabhishek Puja", "Griha Pravesh Puja"];

const stateTempleMap = {
  "andhra pradesh": "tirupati-balaji-temple",
  assam: "kamakhya-temple",
  bihar: "mahabodhi-temple",
  chandigarh: "mansa-devi-temple",
  chhattisgarh: "mahamaya-temple-ratanpur",
  delhi: "akshardham-temple-delhi",
  goa: "mangeshi-temple",
  gujarat: "akshardham-gandhinagar",
  haryana: "mansa-devi-temple",
  jharkhand: "baidyanath-temple",
  karnataka: "iskcon-temple-bangalore",
  kerala: "padmanabhaswamy-temple",
  "madhya pradesh": "mahakaleshwar-temple",
  maharashtra: "dagdusheth-ganpati",
  odisha: "lingaraj-temple",
  punjab: "golden-temple",
  rajasthan: "birla-mandir-jaipur",
  "tamil nadu": "kapaleeshwarar-temple",
  telangana: "birla-mandir-hyderabad",
  uttarakhand: "har-ki-pauri",
  "uttar pradesh": "kashi-vishwanath-temple",
  "west bengal": "kalighat-temple"
};

function stringHash(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

function slugifyCity(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveTempleKey(city) {
  const slug = slugifyCity(city?.slug || city?.name);
  if (slug && templeImageMap[slug]) {
    return templeImageMap[slug];
  }

  const stateKey = String(city?.state || "").trim().toLowerCase();
  if (stateKey && stateTempleMap[stateKey]) {
    return stateTempleMap[stateKey];
  }

  return "";
}

function resolveTempleImagePath(templeKey) {
  if (!templeKey) {
    return FALLBACK_CITY_IMAGE;
  }

  for (const extension of TEMPLE_IMAGE_EXTENSIONS) {
    const fileName = `${templeKey}${extension}`;
    const filePath = path.join(TEMPLE_IMAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
      return `/images/cities/temples/${fileName}`;
    }
  }

  return FALLBACK_CITY_IMAGE;
}

function formatTempleLabel(templeKey, cityName) {
  if (!templeKey) {
    return cityName ? `${cityName} Temple` : "Sacred Temple";
  }

  return templeKey
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export function getCityImagePath(city) {
  const templeKey = resolveTempleKey(city);
  return resolveTempleImagePath(templeKey);
}

export function getCityDisplayStats(city) {
  const fallbackSeed = stringHash(`${city?.slug || city?.name || "city"}-${city?.state || ""}`);
  const pandits =
    typeof city?._count?.pandits === "number" && city._count.pandits > 0
      ? city._count.pandits
      : 12 + (fallbackSeed % 45);
  const pujaConducted =
    typeof city?._count?.bookings === "number" && city._count.bookings > 0
      ? city._count.bookings
      : 150 + (fallbackSeed % 1200);

  return {
    pandits,
    pujaConducted
  };
}

export function toCityCardData(city) {
  const stats = getCityDisplayStats(city);
  const templeKey = resolveTempleKey(city);
  return {
    ...city,
    image: getCityImagePath(city),
    templeName: formatTempleLabel(templeKey, city?.name),
    popularPujas: DEFAULT_POPULAR_PUJAS,
    isAvailable: true,
    stats,
    templeKey
  };
}

export const CITY_CARD_FALLBACK_IMAGE = FALLBACK_CITY_IMAGE;
