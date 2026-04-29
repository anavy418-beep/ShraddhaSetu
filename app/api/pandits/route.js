import { PanditVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const pandits = await prisma.panditProfile.findMany({
      where: { verificationStatus: PanditVerificationStatus.APPROVED },
      include: {
        user: true,
        city: true
      },
      orderBy: { rating: "desc" }
    });

    return jsonOk({
      pandits: pandits.map((item) => ({
        id: item.id,
        name: item.user.name,
        experience: item.experienceYears,
        city: item.city.name,
        languages: item.languages.split(",").map((lang) => lang.trim()),
        specialization: item.specialization.split(",").map((spec) => spec.trim()),
        rating: item.rating,
        verified: true
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch pandits.", 500);
  }
}
