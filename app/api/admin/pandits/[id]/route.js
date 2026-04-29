import { PanditVerificationStatus, Role, SubscriptionStatus } from "@prisma/client";
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

    if (!["approve", "reject", "approve-plan", "reject-plan"].includes(action)) {
      return jsonError("Invalid action.", 400);
    }

    if (action === "approve-plan" || action === "reject-plan") {
      const durationDays = Math.max(30, Number(body.durationDays || 90));
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const subscriptionStatus = action === "approve-plan" ? SubscriptionStatus.active : SubscriptionStatus.rejected;

      const updatedPlan = await prisma.panditProfile.update({
        where: { id },
        data: {
          subscriptionStatus,
          subscriptionApprovedAt: action === "approve-plan" ? now : null,
          subscriptionExpiresAt: action === "approve-plan" ? expiresAt : null,
          subscriptionApprovedById: action === "approve-plan" ? user.id : null
        },
        include: {
          user: true
        }
      });

      return jsonOk({
        message: action === "approve-plan" ? "Subscription approved successfully." : "Subscription rejected successfully.",
        pandit: {
          id: updatedPlan.id,
          name: updatedPlan.user.name,
          subscriptionPlan: updatedPlan.subscriptionPlan,
          subscriptionStatus: updatedPlan.subscriptionStatus,
          subscriptionExpiresAt: updatedPlan.subscriptionExpiresAt
        }
      });
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
