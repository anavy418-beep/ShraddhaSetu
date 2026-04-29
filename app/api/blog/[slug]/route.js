import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true }
    });

    if (!post || !post.isPublished) {
      return jsonError("Blog post not found.", 404);
    }

    return jsonOk({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        tags: post.tags,
        category: post.category.name,
        categorySlug: post.category.slug,
        publishedAt: post.publishedAt,
        serviceSlug: post.serviceSlug,
        citySlug: post.citySlug
      }
    });
  } catch (error) {
    console.error(error);
    return jsonError("Unable to fetch blog post.", 500);
  }
}
