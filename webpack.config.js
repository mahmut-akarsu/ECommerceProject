// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // <--- WEBPACK'İ IMPORT EDİN
require('dotenv').config(); // <--- .env dosyasını yüklemek için dotenv'ı import edin

module.exports = {
  // ... mode, entry, output, module, resolve ... (önceki gibi)
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    // ORTAM DEĞİŞKENLERİNİ TANIMLAMAK İÇİN DefinePlugin'İ EKLEYİN
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL),
      // Diğer REACT_APP_ ile başlayan değişkenleriniz varsa onları da buraya ekleyin
      // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development') // Geliştirme modu için
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3001, // Veya seçtiğiniz port
    open: true,
    historyApiFallback: true,
    hot: true,
  },
  devtool: 'eval-source-map',
};