const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const rootPath = process.cwd()
let {
  NODE_ENV, // 环境参数
  WEB_ENV, // 环境参数
  target, // 环境参数
  htmlWebpackPluginOptions = '',
} = process.env // 环境参数

htmlWebpackPluginOptions = (() => {
  const regex = /(?<=\{)(.+?)(?=\})/g // {} 花括号，大括号
  htmlWebpackPluginOptions = htmlWebpackPluginOptions.match(regex)
  if (htmlWebpackPluginOptions) {
    htmlWebpackPluginOptions = htmlWebpackPluginOptions[0]
    let htmlWebpackPluginOptionsArr = htmlWebpackPluginOptions.split(',')
    htmlWebpackPluginOptions = {}
    for (let item of htmlWebpackPluginOptionsArr) {
      let [key, value] = item.split(':')
      htmlWebpackPluginOptions[`${key}`] = value
    }
  } else {
    htmlWebpackPluginOptions = {}
  }
  return htmlWebpackPluginOptions
})()

module.exports = {
  devServer: {
    open: true,
    contentBase: 'assets',
    hot: true,
    historyApiFallback: true,
    liveReload: true, // 编译之后是否自动刷新浏览器
    writeToDisk: true, // 写入硬盘
    port: 5000,
  },
  watch: true,
  watchOptions: {
    //延迟监听时间
    aggregateTimeout: 500,
    //忽略监听文件夹
    ignored: '/node_modules/',
  },
  // context: path.join(process.cwd(), '/client'),
  devtool: 'source-map',
  module: {
    rules: [
      // css
      {
        test: /\.css$/i,
        // 排除文件,因为这些包已经编译过，无需再次编译
        // exclude: /(node_modules|bower_components)/,
        use: [
          // 'thread-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                    {
                      // Options
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
      //   less
      {
        test: /\.less$/i,
        use: [
          // 'thread-loader',
          // compiles Less to CSS
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                    {
                      // Options
                    },
                  ],
                ],
              },
            },
          },
        ],
      },

      // //  scss
      // {
      //     test: /\.s[ac]ss$/i,
      //     use: [
      //         // 'thread-loader',
      //         MiniCssExtractPlugin.loader,
      //         // Translates CSS into CommonJS
      //         'css-loader',
      //         // Compiles Sass to CSS
      //         // 'sass-loader',
      //         {
      //             loader: 'sass-loader',
      //             options: {
      //                 // Prefer `dart-sass`
      //                 implementation: require('sass'),
      //                 sourceMap: true,
      //             },
      //         },
      //         {
      //             loader: 'postcss-loader',
      //             options: {
      //                 postcssOptions: {
      //                     plugins: [
      //                         [
      //                             'autoprefixer',
      //                             {
      //                                 // Options
      //                             },
      //                         ],
      //                     ],
      //                 },
      //             },
      //         },
      //     ],
      // },
    ],
    // rules: [
    //     // css
    //     {
    //         test: /\.css$/i,
    //         // 排除文件,因为这些包已经编译过，无需再次编译
    //         // exclude: /(node_modules|bower_components)/,
    //         use: [
    //             // 'thread-loader',
    //             'style-loader',
    //             // MiniCssExtractPlugin.loader,
    //             {
    //                 loader: 'css-loader',
    //                 options: {
    //                     sourceMap: true,
    //                 },
    //             },
    //             {
    //                 loader: 'postcss-loader',
    //                 options: {
    //                     postcssOptions: {
    //                         plugins: [
    //                             [
    //                                 'autoprefixer',
    //                                 {
    //                                     // Options
    //                                 },
    //                             ],
    //                         ],
    //                     },
    //                 },
    //             },
    //         ],
    //     },
    //     //   less
    //     {
    //         test: /\.less$/i,
    //         use: [
    //             // 'thread-loader',
    //             // compiles Less to CSS
    //             // MiniCssExtractPlugin.loader,
    //             'style-loader',
    //             'css-loader',
    //             {
    //                 loader: 'less-loader',
    //                 options: {
    //                     sourceMap: true,
    //                 },
    //             },
    //             {
    //                 loader: 'postcss-loader',
    //                 options: {
    //                     postcssOptions: {
    //                         plugins: [
    //                             [
    //                                 'autoprefixer',
    //                                 {
    //                                     // Options
    //                                 },
    //                             ],
    //                         ],
    //                     },
    //                 },
    //             },
    //         ],
    //     },
    // ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),

    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
  ],
}
