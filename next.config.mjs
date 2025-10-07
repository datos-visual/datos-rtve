import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const propsPackage = require('./package.json')

// Leer configuración local (equivalente a rtve-module-properties)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const propsConfig = JSON.parse(readFileSync(join(__dirname, 'props', 'config.json'), 'utf8'))

// Obtener configuración según entorno
const env = process.env.APP_ENV || 'development'
const envConfig = propsConfig[env] || propsConfig.development

// Simular properties.js2Domain (que viene de rtve-module-properties)
const properties = {
  js2Domain: envConfig.domains?.js || '',
  basePath: envConfig.basePath || ''
}

const nextConfig = {
  basePath: properties.basePath,
  generateBuildId: async () => {
    return propsPackage.version
  },
  compress: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false
  },
  trailingSlash: true,
  images: {
    loader: env === 'preproduction' || env === 'production' ? 'custom' : 'default',
    loaderFile: './app/utils/imageLoader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fotografias.larazon.es'
      },
      {
        protocol: 'https',
        hostname: 'www.rtve.es'
      },
      {
        protocol: 'https',
        hostname: 'img.rtve.es'
      },
      {
        protocol: 'https',
        hostname: 'img-pre.rtve.es'
      },
      {
        protocol: 'https',
        hostname: 'css-pre.rtve.es'
      },
      {
        protocol: 'https',
        hostname: 'css.rtve.es'
      },
      {
        protocol: 'https',
        hostname: 'js.rtve.es'
      },
      {
        protocol: 'https',
        hostname: 'js-pre.rtve.es'
      }
    ]
  },
  env: {
    APP_ENV: env
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.filename = 'static/chunks/[name]-' + propsPackage.version + '.js'
      // En PRE/PROD ignoramos SCSS/SASS porque el CSS se sirve estático desde css.rtve.es
      if (env !== 'development') {
        config.module.rules.push({
          test: /\.(scss|sass)$/,
          use: 'null-loader'
        })
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false
      }
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  }
}

// Establecer assetPrefix igual que en los proyectos RTVE
// nextConfig.assetPrefix = `${properties.js2Domain}/pages/${propsPackage.distName}/${propsPackage.version}`

export default nextConfig
