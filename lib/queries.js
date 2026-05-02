import { PanditVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCSV, serializeService } from "@/lib/serializers";

async function safeQuery(queryFn, fallbackValue) {
  try {
    return await queryFn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("DB query failed, returning fallback value.", error);
    }
    return fallbackValue;
  }
}

export async function getCities() {
  return safeQuery(
    () =>
      prisma.city.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
      }),
    []
  );
}

export async function getServices({ search = "", category = "" } = {}) {
  const services = await safeQuery(
    () =>
      prisma.pujaService.findMany({
        where: {
          isActive: true,
          ...(search
            ? {
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                  { category: { contains: search } }
                ]
              }
            : {}),
          ...(category ? { category } : {})
        },
        orderBy: { createdAt: "desc" }
      }),
    []
  );
  return services.map(serializeService);
}

export async function getServiceBySlug(slug) {
  const service = await safeQuery(() => prisma.pujaService.findUnique({ where: { slug } }), null);
  return service ? serializeService(service) : null;
}

export async function getApprovedPandits() {
  const pandits = await safeQuery(
    () =>
      prisma.panditProfile.findMany({
        where: { verificationStatus: PanditVerificationStatus.APPROVED },
        include: { user: true, city: true },
        orderBy: { createdAt: "desc" }
      }),
    []
  );
  const planWeight = {
    FEATURED: 3,
    PREMIUM: 2,
    BASIC: 1
  };

  return pandits
    .sort((a, b) => {
      const aActive = a.subscriptionStatus === "active" ? 1 : 0;
      const bActive = b.subscriptionStatus === "active" ? 1 : 0;
      if (bActive !== aActive) {
        return bActive - aActive;
      }
      const aPlan = planWeight[a.subscriptionPlan] || 0;
      const bPlan = planWeight[b.subscriptionPlan] || 0;
      if (bPlan !== aPlan) {
        return bPlan - aPlan;
      }
      return b.rating - a.rating;
    })
    .map((item) => ({
    id: item.id,
    userId: item.user.id,
    name: item.user.name,
    experience: item.experienceYears,
    city: item.city.name,
    languages: parseCSV(item.languages),
    specialization: parseCSV(item.specialization),
    rating: item.rating,
    subscriptionPlan: item.subscriptionPlan,
    subscriptionStatus: item.subscriptionStatus,
    verified: true
    }));
}

export async function getProducts() {
  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      }),
    []
  );

  return products.map((product) => ({
    ...product,
    image: product.image || "/images/puja-placeholder.jpg"
  }));
}

export async function getPublicReviews() {
  const reviews = await safeQuery(
    () =>
      prisma.review.findMany({
        where: { isApproved: true },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 12
      }),
    []
  );
  return reviews.map((item) => ({
    id: item.id,
    customer: item.user.name,
    rating: item.rating,
    text: item.text
  }));
}

export async function getUniqueServiceCategories() {
  const preferredOrder = [
    "Home & Prosperity",
    "Marriage & Family",
    "Dosha Nivaran & Shanti",
    "Ancestor & Shraddha",
    "Festival Pujas",
    "Path / Jaap",
    "Business & Prosperity"
  ];
  const categories = await safeQuery(
    () =>
      prisma.pujaService.findMany({
        distinct: ["category"],
        where: { isActive: true },
        select: { category: true }
      }),
    []
  );
  const values = categories.map((item) => item.category);
  const ordered = preferredOrder.filter((item) => values.includes(item));
  const remaining = values.filter((item) => !preferredOrder.includes(item)).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...remaining];
}

export async function getBlogCategories() {
  return safeQuery(
    () =>
      prisma.blogCategory.findMany({
        orderBy: { name: "asc" }
      }),
    []
  );
}

export async function getBlogPosts({ categorySlug = "" } = {}) {
  return safeQuery(
    () =>
      prisma.blogPost.findMany({
        where: {
          isPublished: true,
          ...(categorySlug ? { category: { slug: categorySlug } } : {})
        },
        include: {
          category: true
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
      }),
    []
  );
}

export async function getBlogPostBySlug(slug) {
  return safeQuery(
    () =>
      prisma.blogPost.findUnique({
        where: { slug },
        include: { category: true }
      }),
    null
  );
}
