/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@popperjs/core': '@popperjs/core/dist/umd/popper.js',
    };
    return config;
  },
  transpilePackages: ['@popperjs/core', 'react-big-calendar', 'react-overlays'],
};

module.exports = nextConfig; 