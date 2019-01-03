//
// Entry point for running production mode.
//

const express = require("express");
const path = require("path");

const server = require("./server-common");

(function initialize() {

    const app = express();

    server.initializeApi(app);
    initializeStatic(app, express);
    server.start(app);
})();

function initializeStatic(app, express) {
    app.use(express.static(path.join(__dirname, "..", "dist")));
    // All else to index.html to support non-root access.
    app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
    });
}