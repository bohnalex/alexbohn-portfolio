import { defineField, defineType } from 'sanity'

export const photoStudioSchema = defineType({
  name: 'photoStudio',
  title: 'Photo Studio',
  type: 'document',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', initialValue: '1,500 sq ft photo studio' }),
    defineField({
      name: 'subhead',
      title: 'Subhead',
      type: 'text',
      rows: 2,
      initialValue: 'Built for small to midsize tabletop, beauty and video productions.',
    }),
    defineField({
      name: 'details',
      title: 'Detail rows',
      description: 'Labeled rows in the left column (Location, Train, Size, Booking…). Add a link to make the value red.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'detail',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'value', title: 'Value', type: 'string' }),
            defineField({ name: 'link', title: 'Link (optional)', type: 'string', description: 'https://…, mailto:… or tel:…' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
    }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero photo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        },
      ],
      options: { layout: 'grid' },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Photo Studio' }
    },
  },
})
