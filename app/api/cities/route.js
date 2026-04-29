import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
    return jsonOk({ cities });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch cities.", 500);
  }
}
