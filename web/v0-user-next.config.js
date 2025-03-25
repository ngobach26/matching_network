/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  // Disable static generation for dynamic routes
  exportPathMap: async () => ({
    "/": { page: "/" },
    "/404": { page: "/404" },
  }),
}

module.exports = nextConfig

