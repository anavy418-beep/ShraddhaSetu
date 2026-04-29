import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { generateBookingId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.USER) {
      return jsonError("Please login as user to create booking.", 401);
    }

    const body = await request.json();
    const serviceSlug = body.serviceSlug;
    const citySlug = body.citySlug;
    const date = body.date;
    const time = body.time;
    const language = body.language;
    const address = body.address;
    const packageName = body.packageName;
    const packagePrice = Number(body.packagePrice || 0);

    if (!serviceSlug || !citySlug || !date || !time || !language || !address || !packageName) {
      return jsonError("Missing required booking fields.", 400);
    }

    const pujaService = await prisma.pujaService.findUnique({ where: { slug: serviceSlug } });
    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!pujaService || !city) {
      return jsonError("Invalid service or city selected.", 404);
    }

    const scheduledFor = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduledFor.getTime())) {
      return jsonError("Invalid booking date or time.", 400);
    }

    const booking = await prisma.booking.create({
      data: {
        bookingId: await generateBookingId(),
        userId: user.id,
        pujaServiceId: pujaService.id,
        cityId: city.id,
        scheduledFor,
        language,
        address,
        packageName,
        packagePrice,
        amount: pujaService.priceFrom + packagePrice,
        status: BookingStatus.pending,
        paymentStatus: PaymentStatus.unpaid,
        notes: body.notes || null
      },
      include: {
        pujaService: true,
        city: true
      }
    });

    return jsonOk({
      message: "Booking created.",
      booking: {
        id: booking.id,
        bookingId: booking.bookingId,
        puja: booking.pujaService.title,
        city: booking.city.name,
        amount: booking.amount,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to create booking.", 500);
  }
}
