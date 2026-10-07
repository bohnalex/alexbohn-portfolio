/** @type {import('next').NextConfig} */
const config = {
  // Sanity Studio lives at /cms; send old/mistyped /studio links to the Photo Studio site
  async redirects() {
    return [
      {
        source: '/studio/:path*',
        destination: 'https://studio.alexbohn.com',
        permanent: false,
      },
    ]
  },
  images: {
    loader: 'custom',
    loaderFile: './sanity/lib/imageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
}

export default config
