import { Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.USER) {
      return jsonError("Unauthorized.", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const action = body.action;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: user.id
      }
    });
    if (!booking) {
      return jsonError("Booking not found.", 404);
    }

    if (action === "cancel") {
      await prisma.booking.update({
        where: { id },
        data: { status: "cancelled" }
      });
      return jsonOk({ message: "Cancellation requested.", status: "cancelled" });
    }

    if (action === "reschedule") {
      const date = body.date;
      const time = body.time;
      if (!date || !time) {
        return jsonError("Date and time required for reschedule.", 400);
      }
      const scheduledFor = new Date(`${date}T${time}:00`);
      await prisma.booking.update({
        where: { id },
        data: { scheduledFor, status: "pending" }
      });
      return jsonOk({ message: "Reschedule requested.", status: "pending" });
    }

    return jsonError("Invalid action.", 400);
  } catch (error) {
    console.error(error);
    return jsonError("Unable to update booking.", 500);
  }
}
