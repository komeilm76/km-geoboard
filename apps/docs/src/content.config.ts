import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    // Extend docsSchema so title is optional with a default — TypeDoc-generated
    // markdown files include an H1 but no frontmatter title, which would fail
    // the strict docsSchema validation.
    schema: (ctx) =>
      docsSchema()(ctx).extend({
        title: z.string().default('API Reference'),
      }),
  }),
};
