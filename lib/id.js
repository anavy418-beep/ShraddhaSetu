import { prisma } from "@/lib/prisma";

function randomDigits(length) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += Math.floor(Math.random() * 10).toString();
  }
  return value;
}

export async function generateBookingId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `SS-${new Date().getFullYear().toString().slice(-2)}${randomDigits(6)}`;
    const exists = await prisma.booking.findUnique({ where: { bookingId: candidate }, select: { id: true } });
    if (!exists) {
      return candidate;
    }
  }
  return `SS-${Date.now()}`;
}

export async function generateOrderId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `ORD-${new Date().getFullYear().toString().slice(-2)}${randomDigits(6)}`;
    const exists = await prisma.shopOrder.findUnique({ where: { orderId: candidate }, select: { id: true } });
    if (!exists) {
      return candidate;
    }
  }
  return `ORD-${Date.now()}`;
}
