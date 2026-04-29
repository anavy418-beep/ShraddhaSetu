import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const phone = body.phone?.trim() || null;
    const citySlug = body.citySlug?.trim() || null;

    if (!name || !email || !password) {
      return jsonError("Name, email and password are required.", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Email already registered.", 409);
    }

    const city = citySlug ? await prisma.city.findUnique({ where: { slug: citySlug } }) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        phone,
        cityId: city?.id || null,
        role: Role.USER
      }
    });

    const token = await createSessionToken(user);
    const response = jsonOk({
      message: "Registration successful.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("Unable to register user.", 500);
  }
}
