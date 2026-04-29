import { prisma } from "@/lib/prisma";
import { serializeService } from "@/lib/serializers";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const service = await prisma.pujaService.findUnique({ where: { slug } });
    if (!service || !service.isActive) {
      return jsonError("Service not found.", 404);
    }
    return jsonOk({ service: serializeService(service) });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch service.", 500);
  }
}
