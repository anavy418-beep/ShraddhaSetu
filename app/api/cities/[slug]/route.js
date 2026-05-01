import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const city = await prisma.city.findUnique({ where: { slug } });
    if (!city || !city.isActive) {
      return jsonError("City not found.", 404);
    }
    return jsonOk({
      city: {
        ...city,
        description: `Book verified pandits for puja, havan and sanskar in ${city.name}, ${city.state || "India"}.`
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch city.", 500);
  }
}
