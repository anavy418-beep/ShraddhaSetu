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
      orderBy: { createdAt: "desc" }
    });

    const planWeight = { FEATURED: 3, PREMIUM: 2, BASIC: 1 };
    const sorted = pandits.sort((a, b) => {
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
    });

    return jsonOk({
      pandits: sorted.map((item) => ({
        id: item.id,
        name: item.user.name,
        experience: item.experienceYears,
        city: item.city.name,
        languages: item.languages.split(",").map((lang) => lang.trim()),
        specialization: item.specialization.split(",").map((spec) => spec.trim()),
        rating: item.rating,
        subscriptionPlan: item.subscriptionPlan,
        subscriptionStatus: item.subscriptionStatus,
        verified: true
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch pandits.", 500);
  }
}
