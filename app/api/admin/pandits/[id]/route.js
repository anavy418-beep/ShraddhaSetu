import { PanditVerificationStatus, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.ADMIN) {
      return jsonError("Admin access required.", 403);
    }

    const { id } = await params;
    const body = await request.json();
    const action = body.action;

    if (!["approve", "reject"].includes(action)) {
      return jsonError("Invalid action.", 400);
    }

    const updated = await prisma.panditProfile.update({
      where: { id },
      data: {
        verificationStatus:
          action === "approve" ? PanditVerificationStatus.APPROVED : PanditVerificationStatus.REJECTED,
        approvedAt: action === "approve" ? new Date() : null,
        approvedById: action === "approve" ? user.id : null
      },
      include: {
        user: true
      }
    });

    return jsonOk({
      message: `Pandit ${action}d successfully.`,
      pandit: {
        id: updated.id,
        name: updated.user.name,
        verificationStatus: updated.verificationStatus
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to update pandit status.", 500);
  }
}
