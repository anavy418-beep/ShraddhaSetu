import { PaymentStatus } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/http";
import { mapPaymentEventStatus, verifyWebhookSignature } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const signature = request.headers.get("x-razorpay-signature") || "";
    const rawBody = await request.text();

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return jsonError("Webhook secret is not configured.", 500);
    }

    const valid = verifyWebhookSignature({ rawBody, signature });
    if (!valid) {
      return jsonError("Invalid webhook signature.", 400);
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.event;
    const mappedStatus = mapPaymentEventStatus(eventName);

    if (!mappedStatus) {
      return jsonOk({ message: "Event ignored." });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    if (!paymentEntity?.order_id || !paymentEntity?.id) {
      return jsonOk({ message: "Payment entity missing." });
    }

    const payment = await prisma.payment.findFirst({
      where: { gatewayOrderId: paymentEntity.order_id },
      include: { booking: true, order: true }
    });

    if (!payment) {
      return jsonOk({ message: "No local payment found for webhook order." });
    }

    const nextStatus =
      mappedStatus === "paid"
        ? PaymentStatus.paid
        : mappedStatus === "failed"
          ? PaymentStatus.failed
          : PaymentStatus.unpaid;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayPaymentId: paymentEntity.id,
        status: nextStatus
      }
    });

    const creditAmount = payment.status === PaymentStatus.unpaid && nextStatus === PaymentStatus.paid ? payment.amount : 0;

    if (payment.bookingId) {
      const updatedPaid = payment.booking.amountPaid + creditAmount;
      const bookingPaymentStatus =
        updatedPaid >= payment.booking.amount
          ? PaymentStatus.paid
          : updatedPaid > 0
            ? PaymentStatus.partial
            : nextStatus;

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          amountPaid: updatedPaid,
          paymentStatus: bookingPaymentStatus,
          paymentRef: paymentEntity.id,
          status:
            bookingPaymentStatus === PaymentStatus.paid || bookingPaymentStatus === PaymentStatus.partial
              ? "confirmed"
              : payment.booking.status
        }
      });
    }

    if (payment.orderId) {
      const updatedPaid = payment.order.amountPaid + creditAmount;
      const orderPaymentStatus =
        updatedPaid >= payment.order.totalAmount
          ? PaymentStatus.paid
          : updatedPaid > 0
            ? PaymentStatus.partial
            : nextStatus;

      await prisma.shopOrder.update({
        where: { id: payment.orderId },
        data: {
          amountPaid: updatedPaid,
          paymentStatus: orderPaymentStatus,
          paymentRef: paymentEntity.id,
          status:
            orderPaymentStatus === PaymentStatus.paid || orderPaymentStatus === PaymentStatus.partial
              ? "confirmed"
              : payment.order.status
        }
      });

      if (orderPaymentStatus === PaymentStatus.paid) {
        await prisma.cartItem.deleteMany({ where: { userId: payment.order.userId } });
      }
    }

    return jsonOk({ message: "Webhook processed." });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to process webhook.", 500);
  }
}
