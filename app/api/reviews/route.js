import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 12
    });
    return jsonOk({
      reviews: reviews.map((item) => ({
        id: item.id,
        customer: item.user.name,
        rating: item.rating,
        text: item.text
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch reviews.", 500);
  }
}
