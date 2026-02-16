import { loadBlogPosts, getAllTags } from "$lib/utils/blog";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  const posts = loadBlogPosts();
  const tags = getAllTags();

  return { posts, tags };
};
