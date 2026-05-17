import { defineField, defineType } from 'sanity'
import { orderRankField } from '@sanity/orderable-document-list'
import { BulkImageUpload } from '../components/BulkImageUpload'
import { MobileLayoutInput } from '../components/MobileLayoutInput'

export const clientGallerySchema = defineType({
  name: 'clientGallery',
  title: 'Client Gallery',
  type: 'document',
  fields: [
    orderRankField({ type: 'clientGallery' }),
    defineField({
      name: 'name',
      title: 'Client Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first',
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
    select: { title: 'name', media: 'images.0' },
  },
  orderings: [
    {
      title: 'Manual Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
