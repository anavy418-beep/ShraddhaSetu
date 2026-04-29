import { Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.ADMIN) {
      return jsonError("Admin access required.", 403);
    }

    const [bookings, pandits] = await Promise.all([
      prisma.booking.findMany({
        include: {
          user: true,
          city: true,
          pujaService: true,
          pandit: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.panditProfile.findMany({
        where: { verificationStatus: "APPROVED" },
        include: { user: true }
      })
    ]);

    return jsonOk({
      bookings: bookings.map((booking) => ({
        id: booking.id,
        bookingId: booking.bookingId,
        customer: booking.user.name,
        puja: booking.pujaService.title,
        city: booking.city.name,
        date: booking.scheduledFor.toISOString().slice(0, 10),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        panditId: booking.panditId,
        panditName: booking.pandit?.name || null
      })),
      pandits: pandits.map((item) => ({
        userId: item.user.id,
        name: item.user.name
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch admin bookings.", 500);
  }
}
