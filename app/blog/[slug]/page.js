import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Not Found | ShraddhaSetu"
    };
  }

  return {
    title: `${post.title} | ShraddhaSetu Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`
    }
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="card">
            <img src={post.coverImage} alt={post.title} style={{ width: "100%", maxHeight: 320, objectFit: "cover" }} />
            <div className="card-body">
              <p className="tag">{post.category.name}</p>
              <p style={{ color: "#4a392f", lineHeight: 1.75, whiteSpace: "pre-line" }}>{post.content}</p>

              <div className="row" style={{ marginTop: 16 }}>
                <Link className="btn btn-outline" href="/blog">
                  Back to Blog
                </Link>
                {post.serviceSlug && (
                  <Link className="btn btn-primary" href={`/services/${post.serviceSlug}`}>
                    Related Puja Service
                  </Link>
                )}
                {post.citySlug && (
                  <Link className="btn btn-outline" href={`/cities/${post.citySlug}`}>
                    Explore City Page
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
