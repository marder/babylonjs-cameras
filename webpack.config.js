const { resolve } = require("path");

module.exports = {

   entry: "./lib/index.js",
   devtool: "source-map",

   output: {
      path: resolve("dist"),
      filename: "babylonjs-cameras.js",
      library: "Marder"
   },

   resolve: {
      extensions: [".ts", ".js"]
   },

   module: {
      rules: [
         {
            test: /\.tsx?$/,
            use: 'awesome-typescript-loader',
            exclude: /node_modules/
         }
      ]
   },

   externals: {
      babylonjs: "BABYLON"
   }

}