import { PanditSubscriptionPlan, PanditVerificationStatus, Role, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim();
    const citySlug = body.citySlug?.trim();
    const experienceYears = Number(body.experienceYears || 0);
    const languages = body.languages?.trim();
    const specialization = body.specialization?.trim();
    const bio = body.bio?.trim() || null;
    const selectedPlan = body.subscriptionPlan || "BASIC";
    const allowedPlans = ["BASIC", "PREMIUM", "FEATURED"];
    const subscriptionPlan = allowedPlans.includes(selectedPlan) ? selectedPlan : "BASIC";

    if (!name || !email || !password || !phone || !citySlug || !languages || !specialization || !experienceYears) {
      return jsonError("All pandit registration fields are required.", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Email already registered.", 409);
    }

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      return jsonError("Selected city does not exist.", 404);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        phone,
        cityId: city.id,
        role: Role.PANDIT,
        panditProfile: {
          create: {
            cityId: city.id,
            experienceYears,
            languages,
            specialization,
            bio,
            verificationStatus: PanditVerificationStatus.PENDING,
            subscriptionPlan: PanditSubscriptionPlan[subscriptionPlan],
            subscriptionStatus: SubscriptionStatus.pending,
            subscriptionSelectedAt: new Date()
          }
        }
      },
      include: {
        panditProfile: true
      }
    });

    const token = await createSessionToken(user);
    const response = jsonOk({
      message: "Pandit registration submitted. Awaiting admin approval.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      verificationStatus: user.panditProfile?.verificationStatus,
      subscriptionPlan: user.panditProfile?.subscriptionPlan,
      subscriptionStatus: user.panditProfile?.subscriptionStatus
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("Unable to register pandit.", 500);
  }
}
