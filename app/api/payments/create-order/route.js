import { PaymentEntity, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

function fakeRazorpayOrderId() {
  return `order_${Math.random().toString(36).slice(2, 14)}`;
}

export async function POST(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || ![Role.USER, Role.ADMIN].includes(user.role)) {
      return jsonError("Unauthorized.", 401);
    }

    const body = await request.json();
    const entityType = body.entityType;
    const entityId = body.entityId;

    if (!entityType || !entityId || !["BOOKING", "ORDER"].includes(entityType)) {
      return jsonError("Invalid payment create request.", 400);
    }

    let amount = 0;
    let bookingId = null;
    let orderId = null;

    if (entityType === PaymentEntity.BOOKING) {
      const booking = await prisma.booking.findUnique({ where: { id: entityId } });
      if (!booking) {
        return jsonError("Booking not found.", 404);
      }
      amount = booking.amount;
      bookingId = booking.id;
    } else {
      const order = await prisma.shopOrder.findUnique({ where: { id: entityId } });
      if (!order) {
        return jsonError("Order not found.", 404);
      }
      amount = order.totalAmount;
      orderId = order.id;
    }

    const gatewayOrderId = fakeRazorpayOrderId();
    const payment = await prisma.payment.create({
      data: {
        entityType,
        bookingId,
        orderId,
        amount,
        gateway: "RAZORPAY",
        gatewayOrderId
      }
    });

    return jsonOk({
      message: "Payment order created.",
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        orderId: gatewayOrderId,
        amount,
        currency: "INR",
        entityType,
        entityId
      },
      paymentId: payment.id
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to create payment order.", 500);
  }
}
