import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { generateOrderId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user || user.role !== Role.USER) {
      return jsonError("Please login as user.", 401);
    }

    const body = await request.json();
    const address = body.address?.trim();
    const paymentMethod = body.paymentMethod?.trim() || "UPI";
    if (!address) {
      return jsonError("Delivery address is required.", 400);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true }
    });
    if (!cartItems.length) {
      return jsonError("Cart is empty.", 400);
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const orderId = await generateOrderId();

    const order = await prisma.shopOrder.create({
      data: {
        orderId,
        userId: user.id,
        totalAmount,
        status: OrderStatus.pending,
        paymentStatus: PaymentStatus.unpaid,
        address,
        paymentMethod,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      }
    });

    await prisma.cartItem.deleteMany({ where: { userId: user.id } });

    return jsonOk(
      {
        message: "Order created successfully.",
        order: {
          id: order.id,
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      },
      201
    );
  } catch (error) {
    console.error(error);
    return jsonError("Unable to complete checkout.", 500);
  }
}
