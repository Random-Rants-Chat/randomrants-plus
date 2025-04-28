const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const pages = ["index", "signin", "signup", "myaccount", "chat"];

module.exports = {
  mode: "production",
  cache: {
    type: "filesystem",
  },
  devtool: 'source-map',
  entry: pages.reduce((acc, page) => {
    acc[page] = `./src/pages/${page}.js`;
    return acc;
  }, {}),
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "shared",
    },
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].b.js",
    clean: true,
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
  ],
};
