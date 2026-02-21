import { siteUrl } from "$lib/config";
import { loadBlogPosts } from "$lib/utils/blog";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = () => {
  const posts = loadBlogPosts();

  const today = new Date().toISOString().split("T")[0];
  const latestPostDate = posts[0]?.date ?? today;

  const urls: { loc: string; lastmod: string; priority: string }[] = [
    { loc: "", lastmod: today, priority: "1.0" },
    { loc: "/blog", lastmod: latestPostDate, priority: "0.8" },
  ];

  for (const post of posts) {
    urls.push({
      loc: `/blog/${post.slug}`,
      lastmod: post.updated ?? post.date,
      priority: "0.7",
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
};
