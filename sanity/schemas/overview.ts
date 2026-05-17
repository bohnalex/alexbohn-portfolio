import { defineField, defineType } from 'sanity'
import { BulkImageUpload } from '../components/BulkImageUpload'
import { MobileLayoutInput } from '../components/MobileLayoutInput'

export const overviewSchema = defineType({
  name: 'overview',
  title: 'Overview',
  type: 'document',
  fields: [
    defineField({
      name: 'images',
      title: 'Curated Images',
      type: 'array',
      options: { layout: 'grid' },
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
    defineField({
      name: 'mobileLayout',
      title: 'Mobile Layout',
      type: 'array',
      description: 'Arrange images into rows for the mobile view. Drag rows to reorder. Click a row to edit its images.',
      of: [{ type: 'mobileRow' }],
      components: { input: MobileLayoutInput },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Overview' }
    },
  },
})
