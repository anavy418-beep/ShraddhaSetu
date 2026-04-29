import { Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.ADMIN) {
      return jsonError("Admin access required.", 403);
    }

    const pandits = await prisma.panditProfile.findMany({
      include: {
        user: true,
        city: true
      },
      orderBy: { createdAt: "desc" }
    });

    return jsonOk({
      pandits: pandits.map((item) => ({
        id: item.id,
        userId: item.user.id,
        name: item.user.name,
        email: item.user.email,
        phone: item.user.phone,
        city: item.city.name,
        experience: item.experienceYears,
        languages: item.languages,
        specialization: item.specialization,
        verificationStatus: item.verificationStatus
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch pandit list.", 500);
  }
}
