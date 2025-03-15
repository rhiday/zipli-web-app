/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable server-side packages
  serverExternalPackages: ['openai'],
};

module.exports = nextConfig;
