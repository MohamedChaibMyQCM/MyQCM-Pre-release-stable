/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["server.myqcmdz.com", "localhost", "res.cloudinary.com"],
  },
  // Add this to ensure font optimization
  optimizeFonts: true, // ← This is key for next/font
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
