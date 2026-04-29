const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shraddhasetu.in";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-dashboard"]
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
