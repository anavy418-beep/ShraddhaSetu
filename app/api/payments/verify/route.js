import { PaymentStatus, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || ![Role.USER, Role.ADMIN].includes(user.role)) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const paymentId = body.paymentId;
    const status = body.status;
    const gatewayPaymentId = body.gatewayPaymentId || `pay_${Math.random().toString(36).slice(2, 14)}`;

    if (!paymentId || !["paid", "failed"].includes(status)) {
      return jsonError("Invalid payment verification payload.", 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        order: true
      }
    });

    if (!payment) {
      return jsonError("Payment record not found.", 404);
    }

    const nextStatus = status === "paid" ? PaymentStatus.paid : PaymentStatus.failed;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        gatewayPaymentId
      }
    });

    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: nextStatus,
          paymentRef: gatewayPaymentId,
          status: nextStatus === PaymentStatus.paid ? "confirmed" : "pending"
        }
      });
    }

    if (payment.orderId) {
      await prisma.shopOrder.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: nextStatus,
          paymentRef: gatewayPaymentId,
          status: nextStatus === PaymentStatus.paid ? "confirmed" : "pending"
        }
      });
    }

    return jsonOk({
      message: "Payment status updated.",
      status: nextStatus,
      redirectTo: nextStatus === PaymentStatus.paid ? "/payment-success" : "/payment-failure"
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to verify payment.", 500);
  }
}
