import { clearSessionCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export async function POST() {
  const response = jsonOk({ message: "Logged out." });
  clearSessionCookie(response);
  return response;
}
