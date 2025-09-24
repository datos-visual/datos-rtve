/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fotografias.larazon.es",
      },
      {
        protocol: "https",
        hostname: "www.rtve.es",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Configuración para manejar dependencias de Node.js en el cliente
    if (!isServer) {
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
        path: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
