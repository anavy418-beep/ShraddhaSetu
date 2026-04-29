import { PaymentEntity, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  calculateAdvanceAmount,
  getCurrency,
  getRazorpayClient,
  getRazorpayKeyId,
  toPaise
} from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || ![Role.USER, Role.ADMIN].includes(user.role)) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const entityType = body.entityType;
    const entityId = body.entityId;
    const paymentOption = body.paymentOption === "ADVANCE" ? "ADVANCE" : "FULL";
    const paymentMethod = body.paymentMethod || "UPI";

    if (!entityType || !entityId || !["BOOKING", "ORDER"].includes(entityType)) {
      return jsonError("Invalid payment create request.", 400);
    }

    let amount = 0;
    let bookingId = null;
    let orderId = null;
    let displayId = "";
    let ownerUserId = "";

    if (entityType === PaymentEntity.BOOKING) {
      const booking = await prisma.booking.findUnique({ where: { id: entityId } });
      if (!booking) {
        return jsonError("Booking not found.", 404);
      }
      ownerUserId = booking.userId;
      displayId = booking.bookingId;
      amount = paymentOption === "ADVANCE" ? calculateAdvanceAmount(booking.amount) : booking.amount;
      bookingId = booking.id;
    } else {
      const order = await prisma.shopOrder.findUnique({ where: { id: entityId } });
      if (!order) {
        return jsonError("Order not found.", 404);
      }
      ownerUserId = order.userId;
      displayId = order.orderId;
      amount = order.totalAmount;
      orderId = order.id;
    }

    if (user.role === Role.USER && ownerUserId !== user.id) {
      return jsonError("You are not authorized for this payment.", 403);
    }

    const razorpay = getRazorpayClient();
    const gatewayOrder = await razorpay.orders.create({
      amount: toPaise(amount),
      currency: getCurrency(),
      receipt: `${entityType}-${displayId}-${Date.now()}`,
      notes: {
        entityType,
        entityId,
        paymentOption,
        paymentMethod
      }
    });

    const payment = await prisma.payment.create({
      data: {
        entityType,
        bookingId,
        orderId,
        amount,
        method: paymentMethod,
        notes: `Payment option: ${paymentOption}`,
        gateway: "RAZORPAY",
        gatewayOrderId: gatewayOrder.id
      }
    });

    return jsonOk({
      message: "Payment order created.",
      razorpay: {
        keyId: getRazorpayKeyId(),
        orderId: gatewayOrder.id,
        amount: gatewayOrder.amount,
        amountInRupees: amount,
        currency: gatewayOrder.currency,
        name: "ShraddhaSetu",
        description:
          entityType === "BOOKING"
            ? `${paymentOption} payment for booking ${displayId}`
            : `Payment for order ${displayId}`,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ""
        },
        entityType,
        entityId,
        paymentOption
      },
      paymentId: payment.id
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to create payment order.", 500);
  }
}
