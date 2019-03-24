/* global __dirname require */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "../dist"),
    publicPath: "./",
    filename: "[name]-[hash].js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "../dist/index.html",
      template: "src/html.ejs",
      inject: "body",
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "[name]-[hash].css" }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["minify"],
        },
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      cacheGroups: {
        default: {
          chunks: "initial",
          name: "bundle",
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          chunks: "initial",
          name: "vendor",
          priority: -10,
          test: /node_modules\/(.*)\.js/,
        },
        styles: {
          test: /\.css$/,
          name: "styles",
          chunks: "all",
          enforce: true,
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: false,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  node: {
    fs: "empty",
  },
  externals: {
    request: {
      commonjs: "request",
      commonjs2: "request",
    },
    os: {
      commonjs: "os",
      commonjs2: "os",
    },
    process: "process",
  },
};
