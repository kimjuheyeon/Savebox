/** @type {import('next').NextConfig} */
const isGithubPages = process.env.NEXT_PUBLIC_SITE_URL?.includes('github.io');

const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
