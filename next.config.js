/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, canvas: false, encoding: false };
    return config;
  },
};