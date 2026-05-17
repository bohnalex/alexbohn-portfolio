import { defineField, defineType } from 'sanity'

export const mobileRowSchema = defineType({
  name: 'mobileRow',
  title: 'Mobile Row',
  type: 'object',
  fields: [
    defineField({
      name: 'rowType',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Pair  (2 images, equal height)', value: 'pair' },
          { title: 'Full Width  (1 horizontal image)', value: 'full' },
        ],
        layout: 'radio',
      },
      initialValue: 'pair',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Add 2 images for Pair, 1 image for Full Width',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),
  ],
  preview: {
    select: { rowType: 'rowType', media: 'images.0' },
    prepare({ rowType, media }: { rowType: string; media: unknown }) {
      return { title: rowType === 'pair' ? 'Pair' : 'Full Width', media }
    },
  },
})
