import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";

    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: { slug: category } } : {})
      },
      include: { category: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
    });

    return jsonOk({
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        tags: post.tags,
        category: post.category.name,
        categorySlug: post.category.slug,
        publishedAt: post.publishedAt,
        serviceSlug: post.serviceSlug,
        citySlug: post.citySlug
      }))
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch blog posts.", 500);
  }
}
