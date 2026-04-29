import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shraddhasetu.in";

export default async function sitemap() {
  let services = [];
  let cities = [];

  try {
    [services, cities] = await Promise.all([
      prisma.pujaService.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.city.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
    ]);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Sitemap generation fallback:", error);
    }
  }

  const staticRoutes = [
    "",
    "/services",
    "/cities",
    "/booking",
    "/e-puja",
    "/panchang",
    "/astrology",
    "/astrology/kundali",
    "/astrology/match-making",
    "/shop",
    "/login",
    "/register",
    "/pandits",
    "/pandit-register",
    "/contact"
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.8
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${BASE_URL}/services/${service.slug}`,
    lastModified: service.updatedAt,
    changeFrequency: "weekly",
    priority: 0.75
  }));

  const cityRoutes = cities.map((city) => ({
    url: `${BASE_URL}/cities/${city.slug}`,
    lastModified: city.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const cityServiceRoutes = cities.flatMap((city) =>
    services.map((service) => ({
      url: `${BASE_URL}/cities/${city.slug}/${service.slug}`,
      lastModified: new Date(Math.max(city.updatedAt.getTime(), service.updatedAt.getTime())),
      changeFrequency: "weekly",
      priority: 0.65
    }))
  );

  return [...staticRoutes, ...serviceRoutes, ...cityRoutes, ...cityServiceRoutes];
}
