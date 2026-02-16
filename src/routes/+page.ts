import { loadBlogPosts } from "$lib/utils/blog";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
  const posts = loadBlogPosts();

  return {
    posts: posts.slice(0, 3),
  };
};
