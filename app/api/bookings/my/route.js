import { Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.USER) {
      return jsonError("Unauthorized.", 401);
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        pujaService: true,
        city: true
      },
      orderBy: { createdAt: "desc" }
    });

    return jsonOk({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        bookingId: booking.bookingId,
        puja: booking.pujaService.title,
        city: booking.city.name,
        date: booking.scheduledFor.toISOString().slice(0, 10),
        time: booking.scheduledFor.toISOString().slice(11, 16),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        package: booking.packageName,
        amount: booking.amount,
        amountPaid: booking.amountPaid
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch bookings.", 500);
  }
}
