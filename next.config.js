/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@popperjs/core': '@popperjs/core/dist/umd/popper.js',
    };
    config.externals = [...(config.externals || []), 'bcrypt'];
    return config;
  },
  transpilePackages: ['@popperjs/core', 'react-big-calendar', 'react-overlays'],
};

module.exports = withNextIntl(nextConfig); 