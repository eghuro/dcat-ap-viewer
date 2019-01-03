//
// Entry point for running only the API.
//

const express = require("express");
const server = require("./server-common");

(function initialize() {
    const app = express();
    server.initializeApi(app);
    server.start(app);
})();
