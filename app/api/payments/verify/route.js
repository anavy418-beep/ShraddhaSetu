import { PaymentStatus, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { verifyCheckoutSignature } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || ![Role.USER, Role.ADMIN].includes(user.role)) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const paymentId = body.paymentId;
    const status = body.status;
    const razorpayOrderId = body.razorpayOrderId;
    const razorpayPaymentId = body.razorpayPaymentId;
    const razorpaySignature = body.razorpaySignature;
    const gatewayPaymentId = razorpayPaymentId || body.gatewayPaymentId || `pay_${Math.random().toString(36).slice(2, 14)}`;

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

    if (user.role === Role.USER) {
      const belongsToUser =
        (payment.booking && payment.booking.userId === user.id) || (payment.order && payment.order.userId === user.id);
      if (!belongsToUser) {
        return jsonError("Unauthorized payment access.", 403);
      }
    }

    const baseStatus = status === "paid" ? PaymentStatus.paid : PaymentStatus.failed;
    let nextStatus = baseStatus;

    if (status === "paid") {
      if (!razorpayOrderId || !gatewayPaymentId || !razorpaySignature) {
        return jsonError("Razorpay verification fields are required.", 400);
      }
      if (razorpayOrderId !== payment.gatewayOrderId) {
        return jsonError("Razorpay order mismatch.", 400);
      }
      const isSignatureValid = verifyCheckoutSignature({
        razorpayOrderId,
        razorpayPaymentId: gatewayPaymentId,
        razorpaySignature
      });
      if (!isSignatureValid) {
        return jsonError("Invalid Razorpay signature.", 400);
      }
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        gatewayPaymentId,
        gatewaySignature: razorpaySignature || null
      }
    });

    const creditAmount = payment.status === PaymentStatus.unpaid ? payment.amount : 0;

    if (payment.bookingId) {
      const booking = payment.booking;
      const amountPaid = booking.amountPaid + creditAmount;
      const bookingPaymentStatus =
        amountPaid >= booking.amount
          ? PaymentStatus.paid
          : amountPaid > 0
            ? PaymentStatus.partial
            : nextStatus === PaymentStatus.failed
              ? PaymentStatus.failed
              : PaymentStatus.unpaid;

      const nextBookingStatus =
        bookingPaymentStatus === PaymentStatus.paid || bookingPaymentStatus === PaymentStatus.partial
          ? "confirmed"
          : booking.status;

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          amountPaid,
          paymentStatus: bookingPaymentStatus,
          paymentRef: gatewayPaymentId,
          status: nextBookingStatus
        }
      });

      if (bookingPaymentStatus === PaymentStatus.partial) {
        nextStatus = PaymentStatus.partial;
      }
    }

    if (payment.orderId) {
      const order = payment.order;
      const amountPaid = order.amountPaid + creditAmount;
      const orderPaymentStatus =
        amountPaid >= order.totalAmount
          ? PaymentStatus.paid
          : amountPaid > 0
            ? PaymentStatus.partial
            : nextStatus === PaymentStatus.failed
              ? PaymentStatus.failed
              : PaymentStatus.unpaid;

      const nextOrderStatus =
        orderPaymentStatus === PaymentStatus.paid || orderPaymentStatus === PaymentStatus.partial
          ? "confirmed"
          : order.status;

      await prisma.shopOrder.update({
        where: { id: payment.orderId },
        data: {
          amountPaid,
          paymentStatus: orderPaymentStatus,
          paymentRef: gatewayPaymentId,
          status: nextOrderStatus
        }
      });

      if (orderPaymentStatus === PaymentStatus.paid) {
        await prisma.cartItem.deleteMany({ where: { userId: order.userId } });
      }

      if (orderPaymentStatus === PaymentStatus.partial) {
        nextStatus = PaymentStatus.partial;
      }
    }

    if (nextStatus !== baseStatus) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: nextStatus }
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
