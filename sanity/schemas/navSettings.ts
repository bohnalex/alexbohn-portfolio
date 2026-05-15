import { defineField, defineType } from 'sanity'

export const navSettingsSchema = defineType({
  name: 'navSettings',
  title: 'Navigation Settings',
  type: 'document',
  fields: [
    defineField({ name: 'portfoliosVisible', title: 'Show Portfolios', type: 'boolean', initialValue: true }),
    defineField({ name: 'selectedClientsVisible', title: 'Show Selected Clients', type: 'boolean', initialValue: true }),
    defineField({ name: 'projectsVisible', title: 'Show Projects', type: 'boolean', initialValue: true }),
    defineField({ name: 'motionVisible', title: 'Show Motion', type: 'boolean', initialValue: true }),
    defineField({ name: 'infoVisible', title: 'Show Info', type: 'boolean', initialValue: true }),
  ],
  preview: {
    prepare() {
      return { title: 'Navigation Settings' }
    },
  },
})
