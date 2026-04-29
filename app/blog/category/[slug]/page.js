import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogCategories, getBlogPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Blog Category Not Found | ShraddhaSetu"
    };
  }

  return {
    title: `${category.name} Articles | ShraddhaSetu Blog`,
    description: category.description || `Read ${category.name.toLowerCase()} articles on ShraddhaSetu.`
  };
}

export default async function BlogCategoryPage({ params }) {
  const { slug } = await params;
  const [categories, posts] = await Promise.all([getBlogCategories(), getBlogPosts({ categorySlug: slug })]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>{category.name}</h1>
          <p>{category.description || "Explore curated spiritual articles."}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row" style={{ marginBottom: 16 }}>
            <Link className="btn btn-outline" href="/blog">
              All Blog Posts
            </Link>
          </div>
          <div className="card-grid">
            {posts.map((post) => (
              <article key={post.id} className="card">
                <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                <div className="card-body">
                  <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>{post.title}</h2>
                  <p style={{ color: "#6f5b4d" }}>{post.excerpt}</p>
                  <Link className="btn btn-primary" href={`/blog/${post.slug}`}>
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {!posts.length && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-body">No posts in this category yet.</div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
