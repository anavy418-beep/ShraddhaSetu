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
        orderBy: { rating: "desc" }
      }),
    []
  );
  return pandits.map((item) => ({
    id: item.id,
    userId: item.user.id,
    name: item.user.name,
    experience: item.experienceYears,
    city: item.city.name,
    languages: parseCSV(item.languages),
    specialization: parseCSV(item.specialization),
    rating: item.rating,
    verified: true
  }));
}

export async function getProducts() {
  return safeQuery(
    () =>
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      }),
    []
  );
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
  const categories = await safeQuery(
    () =>
      prisma.pujaService.findMany({
        distinct: ["category"],
        where: { isActive: true },
        select: { category: true }
      }),
    []
  );
  return categories.map((item) => item.category);
}
