import Link from "next/link";
import { getBlogCategories, getBlogPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Spiritual Blog | ShraddhaSetu",
  description: "Read practical guides on puja, festivals, astrology and panchang from ShraddhaSetu."
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getBlogPosts(), getBlogCategories()]);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>ShraddhaSetu Blog</h1>
          <p>Ritual guides, festival planning and astrology insights for devotees.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row" style={{ marginBottom: 16 }}>
            {categories.map((category) => (
              <Link className="chip" key={category.id} href={`/blog/category/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>

          <div className="card-grid">
            {posts.map((post) => (
              <article key={post.id} className="card">
                <img src={post.coverImage} alt={post.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                <div className="card-body">
                  <p className="tag" style={{ marginBottom: 10 }}>{post.category.name}</p>
                  <h2 style={{ marginTop: 0, fontSize: "1.15rem" }}>{post.title}</h2>
                  <p style={{ color: "#6f5b4d" }}>{post.excerpt}</p>
                  <div className="row" style={{ marginTop: 12 }}>
                    <Link className="btn btn-outline" href={`/blog/${post.slug}`}>
                      Read Article
                    </Link>
                    {post.serviceSlug && (
                      <Link className="btn btn-outline" href={`/services/${post.serviceSlug}`}>
                        Related Puja
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
