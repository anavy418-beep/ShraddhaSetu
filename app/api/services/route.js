import { prisma } from "@/lib/prisma";
import { serializeService } from "@/lib/serializers";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const services = await prisma.pujaService.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { title: { contains: query } },
                { description: { contains: query } },
                { category: { contains: query } }
              ]
            }
          : {}),
        ...(category ? { category } : {})
      },
      orderBy: { createdAt: "desc" }
    });
    return jsonOk({ services: services.map(serializeService) });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch services.", 500);
  }
}
