const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  cache: {
    type: 'filesystem',
  },
  entry: {
    home: "./src/pages/home.js",
    signin: "./src/pages/signin.js",
    signup: "./src/pages/signup.js",
    myaccount: "./src/pages/myaccount.js",
    chat: "./src/pages/chat.js",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "shared",
    },
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].b.js",
  },
  module: {
    rules: [
      {
        test: /\.css/i,
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.txt/i,
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      title: "Random Rants +",
      template: "./webpackhtml/base.html",
      chunks: ["home"],
    }),
    new HtmlWebpackPlugin({
      filename: "signin.html",
      title: "Random Rants + | Sign In",
      template: "./webpackhtml/base.html",
      chunks: ["signin"],
    }),
    new HtmlWebpackPlugin({
      filename: "signup.html",
      title: "Random Rants + | Sign Up",
      template: "./webpackhtml/base.html",
      chunks: ["signup"],
    }),
    new HtmlWebpackPlugin({
      filename: "myaccount.html",
      title: "Random Rants + | My Account",
      template: "./webpackhtml/base.html",
      chunks: ["myaccount"],
    }),
    new HtmlWebpackPlugin({
      filename: "myaccount.html",
      title: "Random Rants + | My Account",
      template: "./webpackhtml/base.html",
      chunks: ["myaccount"],
    }),
    new HtmlWebpackPlugin({
      filename: "chat.html",
      title: "Random Rants +",
      template: "./webpackhtml/base.html",
      chunks: ["chat"],
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./wpstatic", to: "." }],
    }),
  ],
  mode: "production",
};
