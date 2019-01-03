const request = require("request");

const config = require("../server-configuration");

module.exports = {
    "getDataset": getDataset,
    "getDistribution": getDistribution,
    "getCodelist": getCodelist,
    "getPreFetch": getPreFetch,
    "getKeywordsByPublishers": getKeywordsByPublishers
};

function getDataset(req, res) {
    const datasetIri = req.query.iri;
    queryDataFromCouchDB("datasets", res, datasetIri);
}

function queryDataFromCouchDB(database, res, recordId) {
    // TODO Update response content-type.
    const url = config.data.couchdb + "/" + database + "/" +
        encodeURIComponent(recordId);
    request.get({"url": url}).on("error", (error) => {
        handleError(res, error);
    }).pipe(res);
}

function handleError(res, error) {
    // TODO Improve logging and error handling #38.
    console.error("Request failed: ", error);
    res.status(500).json({
        "error": "service_request_failed"
    });
}

function getDistribution(req, res) {
    const distributionIri = req.query.iri;
    queryDataFromCouchDB("distributions", res, distributionIri);
}

function getCodelist(req, res) {
    const itemIri = req.query.iri;
    queryDataFromCouchDB("codelists", res, itemIri);
}

function getPreFetch(req, res) {
    queryDataFromCouchDB("static", res, "initial_data_cache");
}

function getKeywordsByPublishers(req, res) {
    queryDataFromCouchDB("static", res, "keywords_by_publishers");
}
