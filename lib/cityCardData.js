import fs from "node:fs";
import path from "node:path";

const FALLBACK_CITY_IMAGE = "/images/cities/default-city.jpg";
const CITY_IMAGE_DIR = path.join(process.cwd(), "public", "images", "cities");

const CITY_IMAGE_MAP = {
  ahmedabad: "/images/cities/ahmedabad.jpg",
  amritsar: "/images/cities/amritsar.jpg",
  ayodhya: "/images/cities/ayodhya.jpg",
  bangalore: "/images/cities/bangalore.jpg",
  bhopal: "/images/cities/bhopal.jpg",
  bhubaneswar: "/images/cities/bhubaneswar.jpg",
  bilaspur: "/images/cities/bilaspur.jpg",
  chandigarh: "/images/cities/chandigarh.jpg",
  chennai: "/images/cities/chennai.jpg",
  coimbatore: "/images/cities/coimbatore.jpg",
  cuttack: "/images/cities/cuttack.jpg",
  dehradun: "/images/cities/dehradun.jpg"
};

const DEFAULT_POPULAR_PUJAS = ["Satyanarayan Puja", "Rudrabhishek Puja", "Griha Pravesh Puja"];

function stringHash(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
}

export function getCityImagePath(slug) {
  if (!slug) {
    return FALLBACK_CITY_IMAGE;
  }

  const mappedPath = CITY_IMAGE_MAP[slug] || `/images/cities/${slug}.jpg`;
  const fileName = mappedPath.replace("/images/cities/", "");
  const filePath = path.join(CITY_IMAGE_DIR, fileName);

  if (fs.existsSync(filePath)) {
    return mappedPath;
  }

  return FALLBACK_CITY_IMAGE;
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
  return {
    ...city,
    image: getCityImagePath(city?.slug),
    popularPujas: DEFAULT_POPULAR_PUJAS,
    isAvailable: true,
    stats
  };
}

export const CITY_CARD_FALLBACK_IMAGE = FALLBACK_CITY_IMAGE;
