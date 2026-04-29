import { Role } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getUserOrFail(request) {
  const user = await getSessionFromRequest(request);
  if (!user || user.role !== Role.USER) {
    return null;
  }
  return user;
}

export async function GET(request) {
  try {
    const user = await getUserOrFail(request);
    if (!user) {
      return jsonError("Please login to access cart.", 401);
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });

    const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    return jsonOk({
      items: items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        image: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.quantity * item.product.price
      })),
      total
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch cart.", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getUserOrFail(request);
    if (!user) {
      return jsonError("Please login to add cart items.", 401);
    }

    const body = await request.json();
    const quantity = Math.max(1, Number(body.quantity || 1));
    const productSlug = body.productSlug;
    const productId = body.productId;

    const product = productSlug
      ? await prisma.product.findUnique({ where: { slug: productSlug } })
      : await prisma.product.findUnique({ where: { id: productId } });

    if (!product || !product.isActive) {
      return jsonError("Product not found.", 404);
    }

    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id
        }
      },
      update: {
        quantity: {
          increment: quantity
        }
      },
      create: {
        userId: user.id,
        productId: product.id,
        quantity
      }
    });

    return jsonOk({ message: "Item added to cart." }, 201);
  } catch (error) {
    console.error(error);
    return jsonError("Unable to add item to cart.", 500);
  }
}

export async function PATCH(request) {
  try {
    const user = await getUserOrFail(request);
    if (!user) {
      return jsonError("Please login to update cart.", 401);
    }

    const body = await request.json();
    const itemId = body.itemId;
    const quantity = Number(body.quantity);
    if (!itemId || !quantity || quantity < 1) {
      return jsonError("Valid item and quantity are required.", 400);
    }

    await prisma.cartItem.updateMany({
      where: { id: itemId, userId: user.id },
      data: { quantity }
    });
    return jsonOk({ message: "Cart updated." });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to update cart.", 500);
  }
}

export async function DELETE(request) {
  try {
    const user = await getUserOrFail(request);
    if (!user) {
      return jsonError("Please login to remove cart item.", 401);
    }
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) {
      return jsonError("Item ID required.", 400);
    }
    await prisma.cartItem.deleteMany({ where: { id: itemId, userId: user.id } });
    return jsonOk({ message: "Item removed." });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to remove item.", 500);
  }
}
