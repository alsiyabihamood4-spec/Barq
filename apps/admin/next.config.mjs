/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@BARQ/theme", "@BARQ/i18n", "@BARQ/types"],
  reactStrictMode: true,
};

export default nextConfig;
