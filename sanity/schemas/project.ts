import { defineField, defineType } from 'sanity'
import { orderRankField } from '@sanity/orderable-document-list'
import { BulkImageUpload } from '../components/BulkImageUpload'
import { MobileLayoutInput } from '../components/MobileLayoutInput'

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    orderRankField({ type: 'project' }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      options: { layout: 'grid' },
      components: { input: BulkImageUpload },
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
          ],
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
    select: { title: 'title', media: 'images.0' },
  },
  orderings: [
    {
      title: 'Manual Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
