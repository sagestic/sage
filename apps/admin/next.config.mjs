/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@sage/ui", "@sage/utils", "@sage/site-schema"],
};

export default nextConfig;
