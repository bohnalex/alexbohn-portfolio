import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'alexbohn-portfolio',
  title: 'Alex Bohn Portfolio',
  projectId: '7qh9c83t',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Overview')
              .id('overview')
              .child(
                S.document()
                  .schemaType('overview')
                  .documentId('singleton-overview')
                  .title('Overview')
              ),
            S.listItem()
              .title('Info')
              .id('info')
              .child(
                S.document()
                  .schemaType('info')
                  .documentId('singleton-info')
                  .title('Info')
              ),
            S.listItem()
              .title('Navigation Settings')
              .id('navSettings')
              .child(
                S.document()
                  .schemaType('navSettings')
                  .documentId('singleton-navSettings')
                  .title('Navigation Settings')
              ),
            S.divider(),
            orderableDocumentListDeskItem({ type: 'portfolio', title: 'Portfolios', S, context }),
            orderableDocumentListDeskItem({ type: 'clientGallery', title: 'Selected Clients', S, context }),
            orderableDocumentListDeskItem({ type: 'project', title: 'Projects', S, context }),
            S.documentTypeListItem('motionEntry').title('Motion'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
