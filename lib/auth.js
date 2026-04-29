import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const AUTH_COOKIE = "shraddhasetu_auth";
const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "replace-with-strong-secret-in-production");

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(user) {
  return new SignJWT({
    sub: user.id,
    role: user.role,
    email: user.email
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(response, token) {
  const configuredSecure = process.env.AUTH_COOKIE_SECURE;
  const secure =
    configuredSecure === "true"
      ? true
      : configuredSecure === "false"
        ? false
        : process.env.NODE_ENV === "production";
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie(response) {
  const configuredSecure = process.env.AUTH_COOKIE_SECURE;
  const secure =
    configuredSecure === "true"
      ? true
      : configuredSecure === "false"
        ? false
        : process.env.NODE_ENV === "production";
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      panditProfile: true
    }
  });
  return user;
}

export async function requireSessionUser(roles = []) {
  const user = await getSessionUser();
  if (!user) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  if (roles.length && !roles.includes(user.role)) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
  return user;
}

export async function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenPair = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${AUTH_COOKIE}=`));
  const token = tokenPair ? tokenPair.slice(AUTH_COOKIE.length + 1) : null;
  if (!token) {
    return null;
  }
  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    return null;
  }
  return prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      panditProfile: true
    }
  });
}
