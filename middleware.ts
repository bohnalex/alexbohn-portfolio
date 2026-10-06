import { NextResponse, type NextRequest } from 'next/server'

// studio.alexbohn.com → the Photo Studio page (lives at /photo-studio,
// since /studio is Sanity Studio)
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  if (host.startsWith('studio.') && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/photo-studio'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
