import { comparePassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const expectedRole = body.role?.trim() || null;

    if (!email || !password) {
      return jsonError("Email and password are required.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { panditProfile: true }
    });
    if (!user) {
      return jsonError("Invalid credentials.", 401);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return jsonError("Invalid credentials.", 401);
    }

    if (expectedRole && expectedRole !== user.role) {
      return jsonError("You do not have access to this login type.", 403);
    }

    const token = await createSessionToken(user);
    const response = jsonOk({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      panditVerificationStatus: user.panditProfile?.verificationStatus || null
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error(error);
    return jsonError("Unable to login.", 500);
  }
}
