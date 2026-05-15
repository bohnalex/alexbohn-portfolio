import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const fontRes = await fetch(
    'https://fonts.gstatic.com/s/archivoblack/v22/HTxqL289NzCGg4MkFpRu19D0fLMi.woff2'
  )
  const fontData = await fontRes.arrayBuffer()

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#111111',
            lineHeight: 1,
            fontFamily: 'Archivo Black',
          }}
        >
          Alex Bohn
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: '0.08em',
            color: '#cd3232',
            textTransform: 'uppercase',
            fontFamily: 'Archivo Black',
          }}
        >
          Photographer
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Archivo Black', data: fontData, weight: 900 }],
    }
  )
}
