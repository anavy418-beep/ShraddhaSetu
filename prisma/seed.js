require("dotenv/config");
const {
  PrismaClient,
  Role,
  PanditVerificationStatus,
  BookingStatus,
  PaymentStatus,
  OrderStatus,
  PanditSubscriptionPlan,
  SubscriptionStatus
} = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const allowProduction = process.argv.includes("--allow-production") || process.env.ALLOW_PROD_SEED === "true";
if (process.env.NODE_ENV === "production" && !allowProduction) {
  console.error("Refusing to seed in production without explicit opt-in.");
  console.error("Use `npm run db:seed:prod` or set ALLOW_PROD_SEED=true.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL
  })
});

const cityNames = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Varanasi",
  "Ujjain",
  "Haridwar",
  "Patna",
  "Lucknow",
  "Ahmedabad"
];

const servicesRaw = [
  {
    title: "Griha Pravesh Puja",
    slug: "griha-pravesh-puja",
    category: "Special Event Puja",
    description: "Sacred home entry ritual for positivity, harmony and vastu blessings.",
    longDescription:
      "The Griha Pravesh ritual invites divine grace into a new home through Vedic mantras, havan and sankalp.",
    priceFrom: 5100,
    duration: "2.5 - 3.5 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Vastu,Havan,Griha Shanti",
    image: "/images/griha-pravesh-puja.png"
  },
  {
    title: "Satyanarayan Puja",
    slug: "satyanarayan-puja",
    category: "Upcoming Pujas",
    description: "Traditional katha and puja for prosperity, family peace and gratitude.",
    longDescription: "Performed on auspicious days and milestones, Satyanarayan Puja combines katha and prasad.",
    priceFrom: 3100,
    duration: "2 - 3 hours",
    languages: "Hindi,Marathi,English",
    specialization: "Satyanarayan Katha,Family Puja",
    image: "/images/satyanarayan-puja.png"
  },
  {
    title: "Rudrabhishek",
    slug: "rudrabhishek",
    category: "Dosha Nivaran Puja",
    description: "Powerful Shiva abhishek for peace, health, spiritual strength and relief.",
    longDescription: "Rudrabhishek is performed with Vedic chants and sacred offerings for Lord Shiva blessings.",
    priceFrom: 4500,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Shiva Puja,Dosha Shanti",
    image: "/images/rudrabhishek-puja.jpg"
  },
  {
    title: "Marriage Puja",
    slug: "marriage-puja",
    category: "Sanskar Puja",
    description: "Sacred marriage rituals for complete wedding ceremonies and blessings.",
    longDescription: "From varmala to saptapadi and kanyadaan, trained pandits conduct complete wedding rituals.",
    priceFrom: 15000,
    duration: "4 - 6 hours",
    languages: "Hindi,Sanskrit,Tamil,Telugu",
    specialization: "Vivah Sanskar,Regional Rituals",
    image: "/images/marriage-puja.jpg"
  },
  {
    title: "Kaal Sarp Dosh Puja",
    slug: "kaal-sarp-dosh-puja",
    category: "Dosha Nivaran Puja",
    description: "Specialized dosha nivaran ritual for harmony, clarity and life progress.",
    longDescription: "This puja is designed to reduce astrological imbalances linked with Kaal Sarp effects.",
    priceFrom: 7100,
    duration: "3 - 4 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Astro Remedies,Naga Puja",
    image: "/images/kaal-sarp-dosh-puja.jpg"
  },
  {
    title: "Pitru Dosh Shanti",
    slug: "pitru-dosh-shanti",
    category: "Mukti Karmas",
    description: "Pitru shanti rituals for ancestral peace and family spiritual wellness.",
    longDescription: "Performed with tarpan and guided vidhi to seek blessings of ancestors.",
    priceFrom: 6100,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Pitru Karya,Tarpan",
    image: "/images/pitru-dosh-shanti.jpg"
  },
  {
    title: "Ganesh Chaturthi Puja",
    slug: "ganesh-chaturthi-puja",
    category: "Festival Puja",
    description: "Auspicious Ganpati sthapana and puja for wisdom, prosperity and obstacle removal.",
    longDescription:
      "Includes avahan, shodashopachar puja, aarti and visarjan guidance according to family tradition.",
    priceFrom: 3600,
    duration: "2 - 3 hours",
    languages: "Hindi,Marathi,Sanskrit",
    specialization: "Ganpati Sthapana,Festival Rituals",
    image: "/images/services/ganesh-chaturthi-puja.webp"
  },
  {
    title: "Saraswati Puja",
    slug: "saraswati-puja",
    category: "Festival Puja",
    description: "Invoke Maa Saraswati for knowledge, creativity and academic success.",
    longDescription: "Ideal for students, artists and institutions with mantra path and vidya sankalp.",
    priceFrom: 3200,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit,Bengali",
    specialization: "Vidya Puja,Festival Rituals",
    image: "/images/services/saraswati-puja.jpg"
  },
  {
    title: "Diwali Puja",
    slug: "diwali-puja",
    category: "Festival Puja",
    description: "Lakshmi-Ganesh puja for abundance, harmony and auspicious beginnings.",
    longDescription: "Includes muhurat guidance, account-book puja, deepa aarti and prosperity sankalp.",
    priceFrom: 4100,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Gujarati",
    specialization: "Lakshmi Puja,Festival Rituals",
    image: "/images/services/diwali-puja.jpg"
  },
  {
    title: "Office Opening Puja",
    slug: "office-opening-puja",
    category: "Business Puja",
    description: "Sacred inauguration puja to begin office operations with divine blessings.",
    longDescription: "Performed with vastu shanti, havan and Lakshmi-Ganesh puja for business growth.",
    priceFrom: 5200,
    duration: "2.5 - 3.5 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Business Inauguration,Vastu Shanti",
    image: "/images/services/office-opening-puja.png"
  },
  {
    title: "Navratri Puja",
    slug: "navratri-puja",
    category: "Festival Puja",
    description: "Durga upasana and kalash sthapana for strength, protection and devotion.",
    longDescription: "Includes ghatasthapana, daily puja guidance, aarti and kanya pujan rituals.",
    priceFrom: 3900,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Gujarati",
    specialization: "Durga Sadhana,Festival Rituals",
    image: "/images/services/navratri-puja.jpg"
  },
  {
    title: "Pind Daan Puja",
    slug: "pind-daan-puja",
    category: "Mukti Karmas",
    description: "Traditional ritual for ancestral peace and spiritual liberation.",
    longDescription: "Performed with Vedic vidhi for pitru tarpan and pind daan at home or tirtha.",
    priceFrom: 7500,
    duration: "3 - 4 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Pitru Karmas,Tarpan Vidhi",
    image: "/images/services/pind-daan-puja.webp"
  },
  {
    title: "Bhoomi Puja",
    slug: "bhoomi-puja",
    category: "Special Event Puja",
    description: "Land worship ritual before construction for safety and success.",
    longDescription: "Includes bhumi shuddhi, vastu puja and sankalp before foundation work.",
    priceFrom: 4800,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Vastu Puja,Construction Rituals",
    image: "/images/services/bhoomi-puja.webp"
  },
  {
    title: "Sunderkand Path",
    slug: "sunderkand-path",
    category: "Path / Jaap",
    description: "Powerful recitation of Sunderkand for courage, protection and positivity.",
    longDescription: "Complete path with Hanuman aarti and sankalp for health, success and peace.",
    priceFrom: 3100,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Ramayan Path,Hanuman Bhakti",
    image: "/images/services/sunderkand-path.jpg"
  },
  {
    title: "Navagraha Shanti Puja",
    slug: "navagraha-shanti-puja",
    category: "Dosha Nivaran Puja",
    description: "Planetary peace ritual to reduce graha dosha and balance life energies.",
    longDescription: "Includes navagraha mantra, havan and remedies based on family requirements.",
    priceFrom: 6900,
    duration: "3 - 4 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Graha Shanti,Astro Remedies",
    image: "/images/services/navagraha-shanti-puja.jpg"
  },
  {
    title: "Namkaran Puja",
    slug: "namkaran-puja",
    category: "Sanskar Puja",
    description: "Naming ceremony with blessings for the newborn’s health and prosperity.",
    longDescription: "Traditional naamkaran sanskar with nakshatra-based naming and family sankalp.",
    priceFrom: 3500,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit,Marathi",
    specialization: "Bal Sanskar,Naming Ceremony",
    image: "/images/services/namkaran-puja.jpg"
  },
  {
    title: "Birthday Puja",
    slug: "birthday-puja",
    category: "Special Event Puja",
    description: "Ayushya puja for long life, wellness and joyful new beginnings.",
    longDescription: "Performed on birthday with sankalp, havan and blessings for the upcoming year.",
    priceFrom: 2900,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Ayushya Puja,Family Rituals",
    image: "/images/services/birthday-puja.jpg"
  },
  {
    title: "Tripindi Shradh Puja",
    slug: "tripindi-shradh-puja",
    category: "Mukti Karmas",
    description: "Sacred shradh ritual for unresolved ancestral karmic peace.",
    longDescription: "Performed with pind daan, tarpan and specific vidhi for pitru shanti.",
    priceFrom: 8600,
    duration: "3 - 4.5 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Shradh Vidhi,Pitru Shanti",
    image: "/images/services/tripindi-shradh-puja.jpg"
  },
  {
    title: "Mahalakshmi Puja",
    slug: "mahalakshmi-puja",
    category: "Festival Puja",
    description: "Invoke Mahalakshmi for wealth, auspiciousness and family wellbeing.",
    longDescription: "Includes Lakshmi avahan, mantra path and prosperity sankalp with aarti.",
    priceFrom: 3800,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Gujarati",
    specialization: "Lakshmi Upasana,Festival Rituals",
    image: "/images/services/mahalakshmi-puja.jpg"
  },
  {
    title: "Narayan Bali Puja",
    slug: "narayan-bali-puja",
    category: "Mukti Karmas",
    description: "Specialized ritual for ancestral relief and karmic peace.",
    longDescription: "Vedic procedure performed for pitru dosha nivaran and family spiritual harmony.",
    priceFrom: 12500,
    duration: "5 - 6 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Narayan Bali,Pitru Remedies",
    image: "/images/services/narayan-bali-puja.jpg"
  },
  {
    title: "Mangal Bhat Puja",
    slug: "mangal-bhat-puja",
    category: "Dosha Nivaran Puja",
    description: "Ritual remedy for Mangal-related obstacles in marriage and harmony.",
    longDescription: "Performed with specific mantras and havan to calm Mars-related astrological effects.",
    priceFrom: 6100,
    duration: "2.5 - 3.5 hours",
    languages: "Hindi,Sanskrit,Marathi",
    specialization: "Mangal Dosha Remedies,Marriage Harmony",
    image: "/images/services/mangal-bhat-puja.jpg"
  },
  {
    title: "Engagement Puja",
    slug: "engagement-puja",
    category: "Sanskar Puja",
    description: "Blessing ceremony for ring exchange and a harmonious marital journey.",
    longDescription: "Includes Ganesh puja, family sankalp and mangal aarti before engagement rituals.",
    priceFrom: 4200,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Pre-Wedding Sanskar,Family Rituals",
    image: "/images/services/engagement-puja.jpg"
  },
  {
    title: "Varshika Shraddha Puja",
    slug: "varshika-shraddha-puja",
    category: "Mukti Karmas",
    description: "Annual ancestral remembrance ritual for peace, blessings and gratitude.",
    longDescription: "Traditional varshik shradh with tarpan, pind pradan and brahman bhojan guidance.",
    priceFrom: 5300,
    duration: "2.5 - 3.5 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Annual Shradh,Pitru Tarpan",
    image: "/images/services/varshika-shraddha-puja.jpg"
  },
  {
    title: "Dhanteras Puja",
    slug: "dhanteras-puja",
    category: "Festival Puja",
    description: "Auspicious Dhanteras ritual for wealth, health and prosperous beginnings.",
    longDescription: "Includes Dhanvantari-Lakshmi puja, deep daan and prosperity sankalp.",
    priceFrom: 3400,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit,Gujarati",
    specialization: "Dhanteras Rituals,Lakshmi Upasana",
    image: "/images/services/dhanteras-puja.jpg"
  },
  {
    title: "Shiv Puran Puja",
    slug: "shiv-puran-puja",
    category: "Path / Jaap",
    description: "Sacred Shiva Purana recitation and puja for spiritual growth and peace.",
    longDescription: "Includes path segments, Rudra mantras and devotional aarti under pandit guidance.",
    priceFrom: 5800,
    duration: "3 - 4 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Shiv Puran Path,Shiva Bhakti",
    image: "/images/services/shiv-puran-puja.jpg"
  },
  {
    title: "Durga Puja",
    slug: "durga-puja",
    category: "Festival Puja",
    description: "Maa Durga worship for courage, protection and divine grace.",
    longDescription: "Performed with Durga saptashati, kumkum archana and traditional aarti.",
    priceFrom: 4300,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Bengali",
    specialization: "Durga Sadhana,Festival Rituals",
    image: "/images/services/durga-puja.jpg"
  },
  {
    title: "Mahamrityunjay Jaap",
    slug: "mahamrityunjay-jaap",
    category: "Path / Jaap",
    description: "Powerful Shiva mantra jaap for health, protection and inner strength.",
    longDescription: "Jaap count and havan can be tailored for wellness, recovery and spiritual upliftment.",
    priceFrom: 6700,
    duration: "3 - 5 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Shiva Mantra Jaap,Healing Rituals",
    image: "/images/services/mahamrityunjay-jaap.jpg"
  },
  {
    title: "Vishwakarma Puja",
    slug: "vishwakarma-puja",
    category: "Business Puja",
    description: "Factory/workplace puja for tools, machinery and productive operations.",
    longDescription: "Includes equipment blessing, safety sankalp and prosperity prayers for teams.",
    priceFrom: 4600,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Bengali",
    specialization: "Workplace Blessings,Business Rituals",
    image: "/images/services/vishwakarma-puja.jpg"
  },
  {
    title: "Godh Bharai Ceremony",
    slug: "godh-bharai-ceremony",
    category: "Sanskar Puja",
    description: "Traditional baby shower ceremony with blessings for mother and child.",
    longDescription: "Includes mangal geet, sankalp and puja rituals as per family customs.",
    priceFrom: 3900,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Marathi",
    specialization: "Maternity Sanskar,Family Rituals",
    image: "/images/services/godh-bharai-ceremony.jpg"
  },
  {
    title: "Hanuman Janmotsav Puja",
    slug: "hanuman-janmotsav-puja",
    category: "Festival Puja",
    description: "Hanuman ji puja and path for strength, devotion and protection.",
    longDescription: "Includes Hanuman Chalisa path, aarti and sankalp for courage and success.",
    priceFrom: 3300,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Hanuman Bhakti,Festival Rituals",
    image: "/images/services/hanuman-janmotsav-puja.webp"
  },
  {
    title: "Marriage Anniversary Puja",
    slug: "marriage-anniversary-puja",
    category: "Special Event Puja",
    description: "Couple blessing puja for harmony, gratitude and renewed commitment.",
    longDescription: "Includes Ganesh-Lakshmi puja, sankalp and aarti for family wellbeing.",
    priceFrom: 3200,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Couple Blessings,Family Rituals",
    image: "/images/services/marriage-anniversary-puja.png"
  },
  {
    title: "Annaprashan Puja",
    slug: "annaprashan-puja",
    category: "Sanskar Puja",
    description: "First-feeding ceremony for babies with health and prosperity blessings.",
    longDescription: "Traditional annaprashan sanskar with puja, mantra and family participation.",
    priceFrom: 3400,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit,Bengali",
    specialization: "Child Sanskar,Family Rituals",
    image: "/images/services/annaprashan-puja.jpg"
  },
  {
    title: "Krishna Janmashtami Puja",
    slug: "krishna-janmashtami-puja",
    category: "Festival Puja",
    description: "Devotional Krishna puja for joy, devotion and family harmony.",
    longDescription: "Includes midnight puja, bhajan, aarti and makhan-mishri bhog rituals.",
    priceFrom: 3600,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,Gujarati",
    specialization: "Krishna Bhakti,Festival Rituals",
    image: "/images/services/krishna-janmashtami-puja.jpg"
  },
  {
    title: "Govardhan Puja",
    slug: "govardhan-puja",
    category: "Festival Puja",
    description: "Ritual worship of Govardhan for gratitude, nourishment and protection.",
    longDescription: "Performed after Diwali with anna-koot offerings and Krishna devotional rituals.",
    priceFrom: 3000,
    duration: "1.5 - 2.5 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Krishna Upasana,Festival Rituals",
    image: "/images/services/govardhan-puja.avif"
  },
  {
    title: "Shuddhikaran Puja",
    slug: "shuddhikaran-puja",
    category: "Special Event Puja",
    description: "Purification ritual for home or workspace to restore spiritual positivity.",
    longDescription: "Includes vastu shuddhi, mantra chanting and havan for cleansing energies.",
    priceFrom: 4700,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit,English",
    specialization: "Space Purification,Vastu Rituals",
    image: "/images/services/shuddhikaran-puja.webp"
  },
  {
    title: "Ram Navami Puja",
    slug: "ram-navami-puja",
    category: "Festival Puja",
    description: "Lord Rama puja for righteousness, peace and family wellbeing.",
    longDescription: "Includes Ramayan path, bhajan, aarti and sankalp during Ram Navami.",
    priceFrom: 3400,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Rama Bhakti,Festival Rituals",
    image: "/images/services/ram-navami-puja.jpg"
  },
  {
    title: "Holika Puja",
    slug: "holika-puja",
    category: "Festival Puja",
    description: "Holika dahan ritual for protection, cleansing and positive transformation.",
    longDescription: "Performed with traditional offerings and prayers on Holika Dahan evening.",
    priceFrom: 2800,
    duration: "1 - 2 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Holi Rituals,Festival Traditions",
    image: "/images/services/holika-puja.avif"
  },
  {
    title: "Kuber Upasana Puja",
    slug: "kuber-upasana-puja",
    category: "Dosha Nivaran Puja",
    description: "Prosperity-focused ritual invoking Lord Kuber for financial stability.",
    longDescription: "Includes Kuber mantra, yantra puja and sankalp for wealth management and growth.",
    priceFrom: 5400,
    duration: "2 - 3 hours",
    languages: "Hindi,Sanskrit",
    specialization: "Wealth Remedies,Kuber Sadhana",
    image: "/images/services/kuber-upasana-puja.jpg"
  },
  {
    title: "Vehicle Puja",
    slug: "vehicle-puja",
    category: "Vehicle Puja",
    description: "New vehicle blessing ritual for safety, success and smooth journeys.",
    longDescription: "Performed with Ganesh puja, raksha sankalp and protective mantra recitation.",
    priceFrom: 2100,
    duration: "45 - 90 minutes",
    languages: "Hindi,Sanskrit,English",
    specialization: "Vahana Puja,Safety Blessings",
    image: "/images/services/vehicle-puja.webp"
  }
];

const serviceCategoryBySlug = {
  "griha-pravesh-puja": "Home & Prosperity",
  "bhoomi-puja": "Home & Prosperity",
  "satyanarayan-puja": "Home & Prosperity",
  "mahalakshmi-puja": "Home & Prosperity",
  "diwali-puja": "Home & Prosperity",
  "office-opening-puja": "Home & Prosperity",
  "vehicle-puja": "Home & Prosperity",
  "marriage-puja": "Marriage & Family",
  "engagement-puja": "Marriage & Family",
  "namkaran-puja": "Marriage & Family",
  "annaprashan-puja": "Marriage & Family",
  "godh-bharai-ceremony": "Marriage & Family",
  "marriage-anniversary-puja": "Marriage & Family",
  "birthday-puja": "Marriage & Family",
  "navagraha-shanti-puja": "Dosha Nivaran & Shanti",
  "kaal-sarp-dosh-puja": "Dosha Nivaran & Shanti",
  "pitru-dosh-shanti": "Dosha Nivaran & Shanti",
  "mahamrityunjay-jaap": "Dosha Nivaran & Shanti",
  rudrabhishek: "Dosha Nivaran & Shanti",
  "narayan-bali-puja": "Dosha Nivaran & Shanti",
  "pind-daan-puja": "Ancestor & Shraddha",
  "tripindi-shradh-puja": "Ancestor & Shraddha",
  "varshika-shraddha-puja": "Ancestor & Shraddha",
  "ganesh-chaturthi-puja": "Festival Pujas",
  "navratri-puja": "Festival Pujas",
  "durga-puja": "Festival Pujas",
  "krishna-janmashtami-puja": "Festival Pujas",
  "ram-navami-puja": "Festival Pujas",
  "holika-puja": "Festival Pujas",
  "dhanteras-puja": "Festival Pujas",
  "saraswati-puja": "Festival Pujas",
  "govardhan-puja": "Festival Pujas",
  "hanuman-janmotsav-puja": "Festival Pujas",
  "sunderkand-path": "Path / Jaap",
  "shiv-puran-puja": "Path / Jaap",
  "vishwakarma-puja": "Business & Prosperity",
  "kuber-upasana-puja": "Business & Prosperity",
  "mangal-bhat-puja": "Business & Prosperity",
  "shuddhikaran-puja": "Dosha Nivaran & Shanti"
};

const serviceImageBySlug = {
  "bhoomi-puja": "/images/services/bhoomi-puja.webp",
  "pind-daan-puja": "/images/services/pind-daan-puja.webp",
  "ganesh-chaturthi-puja": "/images/services/ganesh-chaturthi-puja.webp",
  "office-opening-puja": "/images/services/office-opening-puja.png",
  "vehicle-puja": "/images/services/vehicle-puja.webp",
  "holika-puja": "/images/services/holika-puja.avif"
};

const services = servicesRaw.map((service) => ({
  ...service,
  category: serviceCategoryBySlug[service.slug] || service.category,
  image: serviceImageBySlug[service.slug] || `/images/services/${service.slug}.jpg`
}));

const products = [
  {
    name: "Griha Pravesh Samagri Kit",
    slug: "griha-pravesh-samagri-kit",
    description: "Complete kit with kalash, havan material, dhoop and essentials.",
    price: 1999,
    image: "https://images.unsplash.com/photo-1606342763041-22be2f0d20f7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Satyanarayan Puja Kit",
    slug: "satyanarayan-puja-kit",
    description: "Curated items for katha, puja setup, and prasad preparation.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1580377968131-4db0832b0f67?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Rudrabhishek Premium Kit",
    slug: "rudrabhishek-premium-kit",
    description: "Bilva patra set, abhishek dravya and temple-grade ingredients.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1605184861755-89f1f19f4a85?auto=format&fit=crop&w=1200&q=80"
  }
];

const blogCategories = [
  { name: "Puja Guides", slug: "puja-guides", description: "Step-by-step ritual guidance and preparation." },
  { name: "Festivals", slug: "festivals", description: "Spiritual significance and celebration calendars." },
  { name: "Astrology", slug: "astrology", description: "Planetary remedies, dosha insights and horoscope basics." },
  { name: "Panchang", slug: "panchang", description: "Daily muhurat, tithi and auspicious timings." }
];

const blogPosts = [
  {
    title: "How to Prepare for Griha Pravesh Puja at Home",
    slug: "prepare-for-griha-pravesh-puja",
    categorySlug: "puja-guides",
    excerpt: "A practical checklist for families planning their first Griha Pravesh ritual.",
    content:
      "Start by finalizing the muhurat and cleaning the house thoroughly. Keep kalash, mango leaves, coconut, havan samagri and ghee ready a day before. Share building access details with the pandit and keep a quiet room for sankalp. After the havan, distribute prasad to family and neighbors. Consistency in sankalp and devotion matters more than scale.",
    coverImage: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=1200&q=80",
    tags: "griha pravesh,puja checklist,home ritual",
    serviceSlug: "griha-pravesh-puja",
    citySlug: "bangalore"
  },
  {
    title: "Satyanarayan Puja: Benefits, Samagri and Best Days",
    slug: "satyanarayan-puja-benefits-and-samagri",
    categorySlug: "puja-guides",
    excerpt: "Understand why Satyanarayan Puja is performed and what to arrange in advance.",
    content:
      "Satyanarayan Puja is ideal for gratitude, prosperity and family harmony. Commonly done on Purnima, weddings and anniversaries. Keep panchamrit ingredients, fruits, flowers and tulsi ready. Reading katha with focus and sharing prasad are central parts of the ritual.",
    coverImage: "https://images.unsplash.com/photo-1573641287741-36f53a6bb6ff?auto=format&fit=crop&w=1200&q=80",
    tags: "satyanarayan,katha,puja benefits",
    serviceSlug: "satyanarayan-puja",
    citySlug: "mumbai"
  },
  {
    title: "Rudrabhishek Ritual Guide for Mondays and Maha Shivratri",
    slug: "rudrabhishek-guide-for-shivratri",
    categorySlug: "puja-guides",
    excerpt: "A concise guide to performing Rudrabhishek with authentic intent.",
    content:
      "Rudrabhishek invokes Lord Shiva through abhishek and Rudra chanting. Use bilva leaves, milk, curd, honey and pure water with mantra recitation. Mondays and Shivratri are popular for this puja. Keep your sankalp specific for health, clarity and inner peace.",
    coverImage: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    tags: "rudrabhishek,shiva puja,shivratri",
    serviceSlug: "rudrabhishek",
    citySlug: "ujjain"
  },
  {
    title: "Navratri Home Puja Plan for Nine Days",
    slug: "navratri-home-puja-plan",
    categorySlug: "festivals",
    excerpt: "Daily focus points for a balanced and disciplined Navratri sadhana.",
    content:
      "Create a fixed morning or evening window and light diya daily. Keep simple bhog and read Durga Saptashati sections consistently. Day-wise discipline is more valuable than elaborate arrangements. Invite family to participate in aarti and kanya pujan respectfully.",
    coverImage: "https://images.unsplash.com/photo-1584608277247-411f2f43b6e2?auto=format&fit=crop&w=1200&q=80",
    tags: "navratri,durga puja,festival guide",
    serviceSlug: null,
    citySlug: "delhi"
  },
  {
    title: "Diwali Lakshmi Puja Muhurat: Common Mistakes to Avoid",
    slug: "diwali-lakshmi-puja-mistakes",
    categorySlug: "festivals",
    excerpt: "Avoid rushed setup and timing errors in Diwali Lakshmi Puja.",
    content:
      "Finalize muhurat from your city panchang and keep the altar ready before sunset. Avoid clutter near the puja place. Keep account books, diya, flowers and prasad arranged early. Perform aarti calmly and ensure all family members join the sankalp.",
    coverImage: "https://images.unsplash.com/photo-1602806184048-5f2805f2ae3d?auto=format&fit=crop&w=1200&q=80",
    tags: "diwali,lakshmi puja,muhurat",
    serviceSlug: null,
    citySlug: "jaipur"
  },
  {
    title: "Kaal Sarp Dosh: When to Consider Shanti Puja",
    slug: "kaal-sarp-dosh-shanti-guide",
    categorySlug: "astrology",
    excerpt: "Know common life patterns and guidance for Kaal Sarp Dosh remedies.",
    content:
      "Kaal Sarp interpretations vary by chart context, so avoid fear-based decisions. Seek qualified consultation before remedies. Shanti puja is usually done at spiritually significant temples or at home with proper vidhi. Pair remedies with disciplined routine and seva.",
    coverImage: "https://images.unsplash.com/photo-1505253216365-3f7b8b64a6c5?auto=format&fit=crop&w=1200&q=80",
    tags: "kaal sarp dosh,astro remedies,shanti puja",
    serviceSlug: "kaal-sarp-dosh-puja",
    citySlug: "varanasi"
  },
  {
    title: "Pitru Dosh Shanti and Annual Tarpan Basics",
    slug: "pitru-dosh-shanti-and-tarpan",
    categorySlug: "astrology",
    excerpt: "A beginner-friendly overview of pitru shanti rituals and timing.",
    content:
      "Pitru shanti is performed to honor ancestors and seek family harmony. Tarpan and shraddha are done with guidance, especially during pitru paksha. Keep clarity in gotra, names and sankalp. The ritual is devotional and should be done with gratitude.",
    coverImage: "https://images.unsplash.com/photo-1474031317822-f51f48735ddd?auto=format&fit=crop&w=1200&q=80",
    tags: "pitru dosh,shraddha,tarpan",
    serviceSlug: "pitru-dosh-shanti",
    citySlug: "haridwar"
  },
  {
    title: "How to Read Daily Panchang for Better Muhurat Planning",
    slug: "how-to-read-daily-panchang",
    categorySlug: "panchang",
    excerpt: "Use tithi, nakshatra and rahu kaal correctly for daily decisions.",
    content:
      "Daily panchang combines tithi, vaar, nakshatra, yog and karan. For most household rituals, avoid rahu kaal and choose favorable lagna windows. Sunrise and sunset vary city-wise, so always reference local panchang. Keep decisions practical and spiritually aligned.",
    coverImage: "https://images.unsplash.com/photo-1601814933868-3749cd0f6a89?auto=format&fit=crop&w=1200&q=80",
    tags: "panchang,muhurat,tithi",
    serviceSlug: null,
    citySlug: "lucknow"
  },
  {
    title: "Marriage Muhurat: Checklist for Families",
    slug: "marriage-muhurat-checklist",
    categorySlug: "panchang",
    excerpt: "A pre-wedding spiritual checklist for selecting date and rituals.",
    content:
      "Start with compatibility review and then shortlist muhurat options. Confirm availability of venue and pandit before finalizing the date. Keep separate timelines for engagement, mehendi and vivah rituals. Balanced planning avoids last-minute stress.",
    coverImage: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
    tags: "marriage muhurat,wedding puja,vivah",
    serviceSlug: "marriage-puja",
    citySlug: "pune"
  },
  {
    title: "E-Puja Etiquette: Joining a Live Ritual from Home",
    slug: "e-puja-etiquette-and-preparation",
    categorySlug: "puja-guides",
    excerpt: "Simple setup tips to participate in online puja with focus and respect.",
    content:
      "Keep a clean and quiet place near your device, arrange diya and flowers, and join 10 minutes early. Share gotra and names accurately beforehand. Follow mantra cues from pandit and keep distractions away. Offer gratitude at the end and note follow-up observances.",
    coverImage: "https://images.unsplash.com/photo-1524492514790-8310dd4b5d9f?auto=format&fit=crop&w=1200&q=80",
    tags: "e-puja,online ritual,live puja",
    serviceSlug: "satyanarayan-puja",
    citySlug: "hyderabad"
  }
];

function citySlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function upsertServiceCatalog(serviceList) {
  for (const service of serviceList) {
    const data = {
      title: service.title,
      slug: service.slug,
      category: service.category,
      description: service.description,
      longDescription: service.longDescription,
      image: service.image,
      priceFrom: service.priceFrom,
      duration: service.duration,
      languages: service.languages,
      specialization: service.specialization,
      isActive: true
    };
    await prisma.pujaService.upsert({
      where: { slug: service.slug },
      create: data,
      update: data
    });
  }
}

async function main() {
  if (allowProduction) {
    for (const service of services) {
      await prisma.pujaService.updateMany({
        where: { slug: service.slug },
        data: { image: service.image }
      });
    }
    console.log(`Safely synced service images for ${services.length} services by slug.`);
    return;
  }

  await prisma.payment.deleteMany();
  await prisma.shopOrderItem.deleteMany();
  await prisma.shopOrder.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.panditProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.pujaService.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.city.deleteMany();

  const createdCities = {};
  for (const name of cityNames) {
    const city = await prisma.city.create({
      data: {
        name,
        slug: citySlug(name)
      }
    });
    createdCities[name] = city;
  }

  await upsertServiceCatalog(services);

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const createdCategories = {};
  for (const category of blogCategories) {
    const created = await prisma.blogCategory.create({ data: category });
    createdCategories[category.slug] = created;
  }

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        tags: post.tags,
        serviceSlug: post.serviceSlug,
        citySlug: post.citySlug,
        isPublished: true,
        publishedAt: new Date(),
        categoryId: createdCategories[post.categorySlug].id
      }
    });
  }

  const admin = await prisma.user.create({
    data: {
      name: "ShraddhaSetu Admin",
      email: "admin@shraddhasetu.in",
      passwordHash: await bcrypt.hash("Admin@123", 10),
      role: Role.ADMIN,
      cityId: createdCities.Delhi.id
    }
  });

  const devotee = await prisma.user.create({
    data: {
      name: "Riya Sharma",
      email: "user@shraddhasetu.in",
      passwordHash: await bcrypt.hash("User@123", 10),
      role: Role.USER,
      phone: "+919000011111",
      cityId: createdCities.Bangalore.id
    }
  });

  const panditUser = await prisma.user.create({
    data: {
      name: "Pt. Rajendra Tripathi",
      email: "pandit@shraddhasetu.in",
      passwordHash: await bcrypt.hash("Pandit@123", 10),
      role: Role.PANDIT,
      phone: "+919000022222",
      cityId: createdCities.Varanasi.id
    }
  });

  await prisma.panditProfile.create({
    data: {
      userId: panditUser.id,
      cityId: createdCities.Varanasi.id,
      experienceYears: 14,
      languages: "Hindi,Sanskrit",
      specialization: "Pitru Karmas,Dosha Nivaran",
      bio: "Experienced in vedic rituals and dosha shanti ceremonies.",
      verificationStatus: PanditVerificationStatus.APPROVED,
      rating: 4.8,
      approvedAt: new Date(),
      approvedById: admin.id,
      subscriptionPlan: PanditSubscriptionPlan.FEATURED,
      subscriptionStatus: SubscriptionStatus.active,
      subscriptionSelectedAt: new Date(),
      subscriptionApprovedAt: new Date(),
      subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      subscriptionApprovedById: admin.id
    }
  });

  const grihaPravesh = await prisma.pujaService.findUnique({ where: { slug: "griha-pravesh-puja" } });

  const booking = await prisma.booking.create({
    data: {
      bookingId: "SS-2401",
      userId: devotee.id,
      panditId: panditUser.id,
      pujaServiceId: grihaPravesh.id,
      cityId: createdCities.Bangalore.id,
      scheduledFor: new Date("2026-05-05T08:30:00.000Z"),
      language: "Hindi",
      address: "Whitefield, Bangalore",
      packageName: "Premium",
      packagePrice: 1500,
      amount: grihaPravesh.priceFrom + 1500,
      amountPaid: grihaPravesh.priceFrom + 1500,
      status: BookingStatus.confirmed,
      paymentStatus: PaymentStatus.paid,
      paymentRef: "pay_seed_001"
    }
  });

  await prisma.review.create({
    data: {
      userId: devotee.id,
      bookingId: booking.id,
      pujaServiceId: grihaPravesh.id,
      rating: 5,
      text: "Very peaceful and authentic ritual experience. Highly recommended.",
      isApproved: true
    }
  });

  const productOne = await prisma.product.findUnique({ where: { slug: "griha-pravesh-samagri-kit" } });
  const order = await prisma.shopOrder.create({
    data: {
      orderId: "ORD-2401",
      userId: devotee.id,
      totalAmount: productOne.price,
      amountPaid: productOne.price,
      status: OrderStatus.confirmed,
      paymentStatus: PaymentStatus.paid,
      paymentRef: "pay_order_001",
      address: "Whitefield, Bangalore",
      paymentMethod: "UPI",
      items: {
        create: [
          {
            productId: productOne.id,
            quantity: 1,
            price: productOne.price
          }
        ]
      }
    }
  });

  await prisma.payment.createMany({
    data: [
      {
        entityType: "BOOKING",
        bookingId: booking.id,
        amount: booking.amount,
        status: PaymentStatus.paid,
        gateway: "RAZORPAY",
        gatewayOrderId: "order_seed_booking",
        gatewayPaymentId: "payment_seed_booking",
        method: "UPI",
        notes: "Seeded full booking payment"
      },
      {
        entityType: "ORDER",
        orderId: order.id,
        amount: order.totalAmount,
        status: PaymentStatus.paid,
        gateway: "RAZORPAY",
        gatewayOrderId: "order_seed_shop",
        gatewayPaymentId: "payment_seed_shop",
        method: "UPI",
        notes: "Seeded full order payment"
      }
    ]
  });

  console.log("Seeded database with admin/user/pandit credentials:");
  console.log("admin@shraddhasetu.in / Admin@123");
  console.log("user@shraddhasetu.in / User@123");
  console.log("pandit@shraddhasetu.in / Pandit@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
