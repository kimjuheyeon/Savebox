/** @type {import('next').NextConfig} */
const isGithubPages = process.env.NEXT_PUBLIC_SITE_URL?.includes('github.io');

const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/Savebox" : "",
  assetPrefix: isGithubPages ? "/Savebox/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
