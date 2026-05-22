import { defineField, defineType } from 'sanity'

export const infoSchema = defineType({
  name: 'info',
  title: 'Info',
  type: 'document',
  fields: [
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'representation',
      title: 'Representation',
      type: 'text',
      rows: 3,
      description: 'Agency / rep contact info',
    }),
    defineField({
      name: 'clientList',
      title: 'Client List',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [], marks: { decorators: [], annotations: [] } }],
      description: 'One client per line/block',
    }),
    defineField({
      name: 'additionalInfo',
      title: 'Additional Info',
      type: 'text',
      description: 'Optional content for the right column',
    }),
    defineField({
      name: 'rightColumnText',
      title: 'Right Column Text',
      type: 'text',
      description: 'Additional text box on the far right of the info page',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Info' }
    },
  },
})
