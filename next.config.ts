module.exports = {
  images: {
    domains: ["static.tanishq.com", "www.tanishq.co.in", "tanishq.co.in"],
  },
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  webpack(config: any) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });

    // ✅ Add this block to support .mp4 imports
    config.module.rules.push({
      test: /\.mp4$/,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/videos/",
            outputPath: "static/videos/",
            name: "[name].[contenthash].[ext]",
          },
        },
      ],
    });

    return config;
  },
};
