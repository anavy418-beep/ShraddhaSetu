require("dotenv/config");
const { PrismaClient, Role, PanditVerificationStatus, BookingStatus, PaymentStatus, OrderStatus } = require("@prisma/client");
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

const services = [
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
    image: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=1200&q=80"
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
    image: "https://images.unsplash.com/photo-1573641287741-36f53a6bb6ff?auto=format&fit=crop&w=1200&q=80"
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
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
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
    image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80"
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
    image: "https://images.unsplash.com/photo-1505253216365-3f7b8b64a6c5?auto=format&fit=crop&w=1200&q=80"
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
    image: "https://images.unsplash.com/photo-1474031317822-f51f48735ddd?auto=format&fit=crop&w=1200&q=80"
  }
];

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

function citySlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function main() {
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

  for (const service of services) {
    await prisma.pujaService.create({ data: service });
  }

  for (const product of products) {
    await prisma.product.create({ data: product });
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
      approvedById: admin.id
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
        gatewayPaymentId: "payment_seed_booking"
      },
      {
        entityType: "ORDER",
        orderId: order.id,
        amount: order.totalAmount,
        status: PaymentStatus.paid,
        gateway: "RAZORPAY",
        gatewayOrderId: "order_seed_shop",
        gatewayPaymentId: "payment_seed_shop"
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
