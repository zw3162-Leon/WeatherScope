/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'openweathermap.org' },
    ],
  },
};

export default nextConfig;
