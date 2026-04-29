import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
    return jsonOk({ products });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch products.", 500);
  }
}
