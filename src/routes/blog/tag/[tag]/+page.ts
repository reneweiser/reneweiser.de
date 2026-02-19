import { loadBlogPosts, getAllTags } from "$lib/utils/blog";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const slug = params.tag.toLowerCase();
  const posts = loadBlogPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === slug),
  );

  if (posts.length === 0) {
    error(404, "Tag not found");
  }

  const displayTag =
    posts[0].tags.find((t) => t.toLowerCase() === slug) ?? slug;

  return { tag: displayTag, posts };
};

export function entries() {
  return getAllTags().map((tag) => ({ tag: tag.toLowerCase() }));
}
