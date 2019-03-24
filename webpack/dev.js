/* globals __dirname require */

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  output: {
    filename: "[name].js",
    path: `${__dirname}/src`,
  },
  watchOptions: { poll: true },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "./index.html",
      template: "src/html.ejs",
      title: ":>",
      inject: "body",
    }),
  ],
  devtool: "source-map",
  devServer: { port: 9000, host: "127.0.0.1" },
  entry: ["babel-polyfill", "./src/index.js"],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
  node: { fs: "empty" },
  externals: {
    request: { commonjs: "request", commonjs2: "request" },
    os: { commonjs: "os", commonjs2: "os" },
    process: "process",
  },
};
