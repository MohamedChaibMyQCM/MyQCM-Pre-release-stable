/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "server.myqcmdz.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin/:path*",
        destination: "http://localhost:3001/admin/:path*",
      },
    ];
  },
  // Add this to ensure font optimization
  optimizeFonts: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(mp4|webm|mov)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/media",
            outputPath: `${isServer ? "../" : ""}static/media/`,
            name: "[name].[hash].[ext]",
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
