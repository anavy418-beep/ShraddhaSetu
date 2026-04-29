import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" }
    });
    return jsonOk({ categories });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch blog categories.", 500);
  }
}
