const request = require("request");

const config = require("../server-configuration");
const queryFactory = require("./sparql-queries");
const sparqlDatasetList = require("./sparql-dataset-list");

module.exports = {
    "getDataset": getDataset,
    "getDistribution": getDistribution,
    "getCodelist": getCodelist
};

// function getDatasets(req, res) {
//     const query = req.query.query;
//     sparqlDatasetList(query).then((data) => {
//         res.json(data);
//     }).catch((error) => {
//         handleError(res, error);
//     });
// }

function getDataset(req, res) {
    const datasetIri = req.query.iri;
    const sparql = queryFactory.createDatasetsListQuery(datasetIri);
    queryDataFromSparql(res, sparql);
}

function queryDataFromSparql(res, sparql) {
    const url = config.data.sparql + "/?" +
        "format=application%2Fx-json%2Bld&" +
        "timeout=0&" +
        "query=" + encodeURIComponent(sparql);

    request.get({"url": url})
        .on("response", response => {
            res.setHeader("Content-Type", "application/json");
            response.pipe(res);
        })
        .on("error", (error) => {
            handleError(res, error);
        })
}

function getDistribution(req, res) {
    const distributionIri = req.query.iri;
    const sparql = queryFactory.createDistributionQuery(distributionIri);
    queryDataFromSparql(res, sparql);
}

function handleError(res, error) {
    // TODO Improve logging and error handling #38.
    console.error("Request failed: ", error);
    res.status(500).json({
        "error": "service_request_failed"
    });
}

function getCodelist(req, res) {
    const itemIri = req.query.iri;
    const sparql = queryFactory.createCodeListQuery(itemIri);
    queryDataFromSparql(res, sparql);
}
