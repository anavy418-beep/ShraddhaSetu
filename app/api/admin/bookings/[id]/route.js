import { Role } from "@prisma/client";
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
    const status = body.status;
    const panditId = body.panditId || null;
    const paymentStatus = body.paymentStatus || undefined;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        panditId
      }
    });

    return jsonOk({
      message: "Booking updated.",
      booking: {
        id: updated.id,
        status: updated.status,
        paymentStatus: updated.paymentStatus
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to update booking.", 500);
  }
}
