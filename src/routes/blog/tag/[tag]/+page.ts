import { loadBlogPosts, getAllTags } from "$lib/utils/blog";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const tag = decodeURIComponent(params.tag);
  const posts = loadBlogPosts().filter((post) => post.tags.includes(tag));

  if (posts.length === 0) {
    error(404, "Tag not found");
  }

  return { tag, posts };
};

export function entries() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }));
}
