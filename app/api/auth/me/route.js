import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getSessionFromRequest(request);
  if (!user) {
    return jsonOk({ user: null });
  }
  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      panditVerificationStatus: user.panditProfile?.verificationStatus || null
    }
  });
}
