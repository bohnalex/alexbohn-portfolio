'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioClient() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        #sanity [data-ui="Stack"]:has(> [data-testid^="field-"]) { gap: 8px !important; }
        #sanity [data-ui="Box"]:has(> [data-testid^="field-"]) { padding-top: 0 !important; padding-bottom: 0 !important; }
        #sanity [data-ui="Stack"]:has(> [data-ui="Box"] > [data-testid^="field-"]) { gap: 8px !important; }
      `}} />
      <NextStudio config={config} />
    </>
  )
}
