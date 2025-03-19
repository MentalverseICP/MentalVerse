// "builds": [
//   {
//     "src": "index.js",
//     "use": "@vercel/node"
//   }
// ],
// "routes": [
//   { "src": "/(.*)", "dest": "/index.js" }
// ],
// "outputDirectory": "dist",
// "public": "dist",

// "build": "npx browserify ./index.js -g [ envify --NODE_ENV production ] -g uglifyify | terser --compress --mangle > ./dist/bundle.js",
// 