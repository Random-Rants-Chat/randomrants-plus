const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VersionUpdatePlugin = require("./versionstampplugin.js");

const pages = [
  "index",
  "signin",
  "signup",
  "myaccount",
  "chat",
  "join",
  "about",
  "security",
  "sitenews",
  "history",
];
try {
  require("fs").rmSync("./public", { recursive: true });
} catch (e) {}

module.exports = {
  mode: "production",
  cache: {
    type: "filesystem",
    allowCollectingMemory: true,
  },
  devtool: false,
  entry: pages.reduce((acc, page) => {
    acc[page] = `./src/pages/${page}.js`;
    return acc;
  }, {}),
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "shared",
    },
    //minimize: false
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].bundle.js",
  },
  watchOptions: {
    ignored: [path.resolve(__dirname, "wpstatic/version.json")], //Ignore version file.
  },
  performance: {
    hints: "warning",
    assetFilter: function (assetFilename) {
      //Ignore warnings for media assets which are typically large files.
      return assetFilename.endsWith(".js") || assetFilename.endsWith(".css");
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: "raw-loader",
            options: {
              esModule: false,
            },
          },
        ],
        type: "javascript/auto", // Fix for raw-loader
      },
      {
        test: /\.txt$/i,
        use: [
          {
            loader: "raw-loader",
            options: {
              esModule: false,
            },
          },
        ],
        type: "javascript/auto",
      },
      {
        test: /\.ttf$/i,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
      {
        test: /\.otf$/i,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          filename: `${page}.html`,
          title: `Random Rants +`,
          template: "./webpackhtml/base.html",
          chunks: [page],
        })
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./wpstatic",
          to: ".",
          noErrorOnMissing: true,
        },
      ],
    }),
    new VersionUpdatePlugin(),
  ],
};
