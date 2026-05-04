import fs from "node:fs";
import path from "node:path";

const FALLBACK_CITY_IMAGE = "/images/cities/default-temple.jpg";
const CITY_IMAGE_DIR = path.join(process.cwd(), "public", "images", "cities", "temples");

const DEFAULT_POPULAR_PUJAS = ["Satyanarayan Puja", "Rudrabhishek Puja", "Griha Pravesh Puja"];

export const templeImageMap = {
  "delhi": "delhi-temple.jpg",
  "new-delhi": "new-delhi-temple.jpg",
  "mumbai": "mumbai-temple.jpg",
  "pune": "pune-temple.jpg",
  "nagpur": "nagpur-temple.jpg",
  "nashik": "nashik-temple.jpg",
  "thane": "thane-temple.jpg",
  "bangalore": "bangalore-temple.jpg",
  "mysore": "mysore-temple.jpg",
  "hyderabad": "hyderabad-temple.jpg",
  "chennai": "chennai-temple.jpg",
  "coimbatore": "coimbatore-temple.jpg",
  "kolkata": "kolkata-temple.jpg",
  "howrah": "howrah-temple.jpg",
  "ahmedabad": "ahmedabad-temple.jpg",
  "surat": "surat-temple.jpg",
  "vadodara": "vadodara-temple.jpg",
  "rajkot": "rajkot-temple.jpg",
  "jaipur": "jaipur-temple.jpg",
  "jodhpur": "jodhpur-temple.jpg",
  "udaipur": "udaipur-temple.jpg",
  "lucknow": "lucknow-temple.jpg",
  "kanpur": "kanpur-temple.jpg",
  "varanasi": "varanasi-temple.jpg",
  "prayagraj": "prayagraj-temple.jpg",
  "ayodhya": "ayodhya-temple.jpg",
  "noida": "noida-temple.jpg",
  "ghaziabad": "ghaziabad-temple.jpg",
  "patna": "patna-temple.jpg",
  "gaya": "gaya-temple.jpg",
  "muzaffarpur": "muzaffarpur-temple.jpg",
  "ranchi": "ranchi-temple.jpg",
  "jamshedpur": "jamshedpur-temple.jpg",
  "bhubaneswar": "bhubaneswar-temple.jpg",
  "cuttack": "cuttack-temple.jpg",
  "indore": "indore-temple.jpg",
  "bhopal": "bhopal-temple.jpg",
  "ujjain": "ujjain-temple.jpg",
  "gwalior": "gwalior-temple.jpg",
  "chandigarh": "chandigarh-temple.jpg",
  "mohali": "mohali-temple.jpg",
  "ludhiana": "ludhiana-temple.jpg",
  "amritsar": "amritsar-temple.jpg",
  "gurugram": "gurugram-temple.jpg",
  "faridabad": "faridabad-temple.jpg",
  "panipat": "panipat-temple.jpg",
  "dehradun": "dehradun-temple.jpg",
  "haridwar": "haridwar-temple.jpg",
  "rishikesh": "rishikesh-temple.jpg",
  "raipur": "raipur-temple.jpg",
  "bilaspur": "bilaspur-temple.jpg",
  "guwahati": "guwahati-temple.jpg",
  "siliguri": "siliguri-temple.jpg",
  "kochi": "kochi-temple.jpg",
  "thiruvananthapuram": "thiruvananthapuram-temple.jpg",
  "kozhikode": "kozhikode-temple.jpg",
  "vijayawada": "vijayawada-temple.jpg",
  "visakhapatnam": "visakhapatnam-temple.jpg",
  "tirupati": "tirupati-temple.jpg",
  "goa": "goa-temple.jpg"
};

export const templeNameMap = {
  "delhi": "Akshardham Temple",
  "new-delhi": "Lotus Temple",
  "mumbai": "Siddhivinayak Temple",
  "pune": "Dagdusheth Halwai Ganpati",
  "nagpur": "Tekdi Ganesh Temple",
  "nashik": "Trimbakeshwar Temple",
  "thane": "Kopineshwar Temple",
  "bangalore": "ISKCON Temple Bangalore",
  "mysore": "Chamundeshwari Temple",
  "hyderabad": "Birla Mandir Hyderabad",
  "chennai": "Kapaleeshwarar Temple",
  "coimbatore": "Adiyogi Shiva",
  "kolkata": "Kalighat Kali Temple",
  "howrah": "Belur Math",
  "ahmedabad": "Jagannath Temple Ahmedabad",
  "surat": "Ambika Niketan Temple",
  "vadodara": "EME Temple",
  "rajkot": "Swaminarayan Temple Rajkot",
  "jaipur": "Birla Mandir Jaipur",
  "jodhpur": "Chamunda Mata Temple",
  "udaipur": "Jagdish Temple",
  "lucknow": "Hanuman Setu Temple",
  "kanpur": "JK Temple",
  "varanasi": "Kashi Vishwanath Temple",
  "prayagraj": "Alopi Devi Mandir",
  "ayodhya": "Shri Ram Mandir",
  "noida": "ISKCON Noida",
  "ghaziabad": "ISKCON Ghaziabad",
  "patna": "Mahavir Mandir",
  "gaya": "Vishnupad Temple",
  "muzaffarpur": "Garibnath Temple",
  "ranchi": "Jagannath Temple Ranchi",
  "jamshedpur": "Bhuvaneshwari Temple",
  "bhubaneswar": "Lingaraj Temple",
  "cuttack": "Cuttack Chandi Temple",
  "indore": "Khajrana Ganesh Temple",
  "bhopal": "Bhojeshwar Temple",
  "ujjain": "Mahakaleshwar Temple",
  "gwalior": "Sun Temple Gwalior",
  "chandigarh": "Chandi Mandir",
  "mohali": "Gurudwara Sri Amb Sahib",
  "ludhiana": "Gurdwara Dukh Niwaran Sahib",
  "amritsar": "Golden Temple",
  "gurugram": "Sheetla Mata Mandir",
  "faridabad": "ISKCON Faridabad",
  "panipat": "Devi Mandir Panipat",
  "dehradun": "Tapkeshwar Mahadev Temple",
  "haridwar": "Har Ki Pauri",
  "rishikesh": "Neelkanth Mahadev Temple",
  "raipur": "Mahamaya Temple Raipur",
  "bilaspur": "Mahamaya Temple Ratanpur",
  "guwahati": "Kamakhya Temple",
  "siliguri": "ISKCON Siliguri",
  "kochi": "Ernakulam Shiva Temple",
  "thiruvananthapuram": "Padmanabhaswamy Temple",
  "kozhikode": "Tali Shiva Temple",
  "vijayawada": "Kanaka Durga Temple",
  "visakhapatnam": "Simhachalam Temple",
  "tirupati": "Tirupati Balaji Temple",
  "goa": "Mangeshi Temple"
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

export function getCityImagePath(city) {
  const slug = slugifyCity(city?.slug || city?.name);
  if (!slug) {
    return FALLBACK_CITY_IMAGE;
  }

  const fileName = templeImageMap[slug] || `${slug}-temple.jpg`;
  const filePath = path.join(CITY_IMAGE_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return `/images/cities/temples/${fileName}`;
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

function getTempleName(city) {
  const slug = slugifyCity(city?.slug || city?.name);
  return templeNameMap[slug] || (city?.name ? `${city.name} Temple` : "Sacred Temple");
}

export function toCityCardData(city) {
  const stats = getCityDisplayStats(city);
  return {
    ...city,
    image: getCityImagePath(city),
    templeName: getTempleName(city),
    popularPujas: DEFAULT_POPULAR_PUJAS,
    isAvailable: true,
    stats
  };
}

export const CITY_CARD_FALLBACK_IMAGE = FALLBACK_CITY_IMAGE;
