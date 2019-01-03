const express = require("express");
const config = require("./../configuration");

const couchdbProvider = require("./data-providers/couchdb-provider");
const solrProvider = require("./data-providers/solr-provider");
const sparqlProvider = require("./data-providers/sparql-provider");

function initializeApi(app) {
    initializeApiRoutes(app);
}

function initializeApiRoutes(app) {
    const provider = {
        ...notImplementedProvider(),
        // ...couchdbProvider,
        // ...solrProvider,
        ...sparqlProvider
    };
    app.use("/api/v1", initializeApiV1(provider));
}

function initializeApiV1(provider) {
    const router = express.Router();
    router.get("/resource/datasets", provider.getDatasets);
    router.get("/resource/dataset", provider.getDataset);
    router.get("/resource/distribution", provider.getDistribution);
    router.get("/resource/codelist", provider.getCodelist);
    router.get("/publishers", provider.getPublishers);
    router.get("/facets", provider.getFacets);
    router.get("/typeahead", provider.getTypeahead);
    router.get("/statistics", provider.getStatistics);
    router.get("/prefetch", provider.getPreFetch);
    router.get("/keywordsByPublishers", provider.getKeywordsByPublishers);
    // Backward compatibility.
    router.get("/solr/info", provider.getStatistics);
    return router;
}

function notImplementedProvider() {
    return {
        "getDatasets": notImplementedHandler,
        "getDataset": notImplementedHandler,
        "getDistribution": notImplementedHandler,
        "getCodelist": notImplementedHandler,
        "getPublishers": notImplementedHandler,
        "getFacets": notImplementedHandler,
        "getTypeahead": notImplementedHandler,
        "getPreFetch": notImplementedHandler,
        "getKeywordsByPublishers": notImplementedHandler,
        "getStatistics": notImplementedHandler
    }
}

function notImplementedHandler(req, res) {
    res.status(500).json({
        "error": "not_implemented"
    });
}

function start(app) {
    const port = config.port;
    app.listen(port, function onStart(error) {
        if (error) {
            console.error(error);
        }
        console.info("Listening on port %s.", port);
    });
}

module.exports = {
    "initializeApi": initializeApi,
    "start": start
};
