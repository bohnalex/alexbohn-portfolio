import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css?family=Archivo+Black',
    { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)' } }
  )
  const css = await cssRes.text()
  const fontUrl = css.match(/src: url\((.+?)\)/)?.[1] ?? ''
  const fontData = await fetch(fontUrl).then((r) => r.arrayBuffer())

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
