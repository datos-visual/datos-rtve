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
};

export default nextConfig;
