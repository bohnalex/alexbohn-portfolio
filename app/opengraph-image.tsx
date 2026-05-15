import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const cssRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
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
