import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px 100px',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#111111',
            lineHeight: 1,
            fontFamily: 'sans-serif',
          }}
        >
          Alex Bohn
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: '#cd3232',
            marginTop: 20,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          Photographer
        </div>
      </div>
    ),
    { ...size }
  )
}
