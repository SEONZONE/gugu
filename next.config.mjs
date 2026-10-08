/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // 가계부 HTML 업로드용 (파일당 15MB + 여유분)
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
