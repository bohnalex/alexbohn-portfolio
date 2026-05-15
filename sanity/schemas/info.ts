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
      of: [{ type: 'string' }],
      description: 'Displayed as a list on the info page',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Info' }
    },
  },
})
