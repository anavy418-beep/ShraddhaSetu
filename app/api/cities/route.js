import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";
import { toCityCardData } from "@/lib/cityCardData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            bookings: true,
            pandits: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
    return jsonOk({
      cities: cities.map((city) => ({
        ...toCityCardData(city),
        description: `Book verified pandits for puja, havan and sanskar in ${city.name}, ${city.state || "India"}.`
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch cities.", 500);
  }
}
