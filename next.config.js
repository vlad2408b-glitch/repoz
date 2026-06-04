/** @type {import('next').NextConfig} */
const nextConfig = {
  // Аватарки Google грузим обычным <img>, поэтому домены для next/image не нужны.
  // Линтинг не должен ронять прод-сборку на Vercel.
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
