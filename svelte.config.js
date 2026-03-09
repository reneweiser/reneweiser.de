import adapter from "@sveltejs/adapter-static";
import { mdsvex, escapeSvelte } from "mdsvex";
import { createHighlighter } from "shiki";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const shikiHighlighter = await createHighlighter({
  themes: ["github-light"],
  langs: [
    "javascript",
    "typescript",
    "svelte",
    "html",
    "css",
    "bash",
    "json",
    "php",
    "blade",
    "yaml",
    "markdown",
    "sql",
    "docker",
    "toml",
  ],
});

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: [".md"],
  highlight: {
    highlighter: (code, lang) => {
      const html = shikiHighlighter.codeToHtml(code, {
        lang: lang || "text",
        theme: "github-light",
      });
      // Remove tabindex="0" from <pre> to avoid Svelte a11y warning
      return escapeSvelte(html.replace(/ tabindex="0"/, ""));
    },
  },
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],
  preprocess: [mdsvex(mdsvexOptions)],
  kit: {
    adapter: adapter({
      fallback: "404.html",
      precompress: true,
    }),
  },
};

export default config;
