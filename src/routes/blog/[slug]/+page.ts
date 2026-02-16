import { getPostBySlug, getAllSlugs } from "$lib/utils/blog";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const result = getPostBySlug(params.slug);

  if (!result) {
    error(404, "Post not found");
  }

  return {
    post: result.post,
    component: result.component,
  };
};

export function entries() {
  return getAllSlugs().map((slug) => ({ slug }));
}
