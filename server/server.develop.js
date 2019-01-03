//
// Entry point for running in develop mode.
//

const express = require("express");
const webpack = require("webpack");
const path = require("path");

const server = require("./server-common");

const webpackConfiguration = require("../build/webpack.develop.js");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");

(function initialize() {
    const app = express();
    server.initializeApi(app);
    initializeWebpack(app);
    initializeStatic(app);
    server.start(app);
})();

function initializeWebpack(app) {
    // https://github.com/webpack-contrib/webpack-hot-middleware
    const webpackCompiler = webpack(webpackConfiguration);
    const middleware = webpackMiddleware(webpackCompiler, {
        "publicPath": webpackConfiguration.output.publicPath.substr(1),
        "stats": {
            "colors": true,
            "chunks": false
        }
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(webpackCompiler));
    app.use("/*", (req, res, next) => {
        middleware(req, res, next);
    });
}

function initializeStatic(app) {
    const assetsPath = path.join(__dirname, "../public/assets");
    app.use("/assets", express.static(assetsPath));
}
