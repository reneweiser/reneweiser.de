import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const isBlogRoute = event.url.pathname.startsWith("/blog");

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      isBlogRoute ? html.replace('lang="de"', 'lang="en"') : html,
  });
};
