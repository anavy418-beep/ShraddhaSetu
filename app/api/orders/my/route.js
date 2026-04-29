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

    const orders = await prisma.shopOrder.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return jsonOk({
      orders: orders.map((order) => ({
        id: order.id,
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        }))
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch orders.", 500);
  }
}
