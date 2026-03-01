/** @type {import('next').NextConfig} */
const isGithubPages = process.env.NEXT_PUBLIC_SITE_URL?.includes('github.io');

const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/saveboxs" : "",
  assetPrefix: isGithubPages ? "/saveboxs/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
