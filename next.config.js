const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Només les imatges que servim nosaltres des de Cloudinary: un comodí «**»
  // deixaria que qualsevol fes servir el nostre optimitzador d'imatges.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  poweredByHeader: false,
  // El feed viu a /api/feed, però /api/ és un directori que robots.txt declara
  // prohibit: els crawlers de feeds (Flipboard, lectors RSS, autodescobriment)
  // no sempre apliquen la regla més específica i es queden amb el Disallow.
  // Aquests camins són els que la gent escriu a mà; tots serveixen el mateix XML.
  async rewrites() {
    return ['/feed.xml', '/feed', '/rss.xml', '/rss'].map((source) => ({
      source,
      destination: '/api/feed',
    }))
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel.app",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.turso.io https://api.resend.com https://*.vercel.app https://api.cloudinary.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Les imatges OG són decoratives: es fan servir com a `og:image` i no
        // han de competir a l'índex de Google. Es descarten amb capçalera, no
        // amb robots.txt: si les bloquegem, Google no pot llegir el `noindex`
        // i l'avís de Search Console només canvia de nom.
        source: '/api/og',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, noimageindex' }],
      },
    ]
  },
}

module.exports = nextConfig
