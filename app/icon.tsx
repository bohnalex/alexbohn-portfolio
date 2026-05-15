import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          color: '#111111',
          fontFamily: 'serif',
        }}
      >
        AB
      </div>
    ),
    { ...size }
  )
}
