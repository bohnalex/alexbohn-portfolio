import { defineField, defineType } from 'sanity'
import { BulkImageUpload } from '../components/BulkImageUpload'

export const overviewSchema = defineType({
  name: 'overview',
  title: 'Overview',
  type: 'document',
  fields: [
    defineField({
      name: 'images',
      title: 'Curated Images',
      type: 'array',
      components: { input: BulkImageUpload },
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
            defineField({
              name: 'linkUrl',
              title: 'Link URL (optional)',
              type: 'string',
              description: 'e.g. /portfolios/beauty',
            }),
          ],
          preview: {
            select: { media: 'image' },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Overview' }
    },
  },
})
