/** @type {import('next').NextConfig} */
const config = {
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
