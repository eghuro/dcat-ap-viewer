const request = require("request");

const config = require("../server-configuration");
const queryFactory = require("./sparql-queries");

const normalizeJsonLd = require("../jsonld/normalize").normalize;
const graphJsonld = require("../jsonld/graph");
const resourceJsonld = require("../jsonld/resource");

module.exports = getDatasets;

function getDatasets(query) {
    return requestJson(createListItemUrl(query))
        .then(collectDatasetFromSelect)
        .then(queryItemsDetails)
        .then((data) => {
            const normalized = normalizeJsonLd(data["jsonld"]);
            const datasets = {};
            graphJsonld.forEachResource(normalized, (resource) => {
                const iri = resourceJsonld.getId(resource);
                datasets[iri] = {
                    "iri": iri,
                    "title": resourceJsonld.getPlainString(
                        resource, "http://purl.org/dc/terms/title"),
                    "description": resourceJsonld.getPlainString(
                        resource, "http://purl.org/dc/terms/description"),
                    "publisherName": resourceJsonld.getPlainString(
                        resource, "http://localhost/publisherName"),
                    "formatName": resourceJsonld.getPlainStringArray(
                        resource, "http://localhost/formatName")
                };
            });
            return {
                "metadata": {
                    // Count as a sum of publishers facets
                },
                "data": data["datasets"].map((iri) => datasets[iri]),
                "facets": {
                    "publishers": [],
                    "themes": [],
                    "keywords": [],
                    "formats": []
                }
            };
        });
}

function createListItemUrl(query) {
    const sparql = queryFactory.createDatasetsListQuery(query);
    return config.data.sparql + "/?" +
        "format=application%2Fsparql-results%2Bjson&" +
        "timeout=0&" +
        "query=" + encodeURIComponent(sparql);
}

function requestJson(url) {
    return new Promise((accept, reject) => {
        request.get({"url": url}, (error, response, body) => {
            if (isResponseOk(error, response)) {
                accept(JSON.parse(body));
            } else {
                reject(error);
            }
        });

    });
}

function isResponseOk(error, response) {
    return error === null && response && response.statusCode === 200;
}

function collectDatasetFromSelect(data) {
    const datasetsBindings = data["results"]["bindings"];
    return datasetsBindings.map((item) => item["dataset"]["value"]);
}

function queryItemsDetails(datasets) {
    const sparql = queryFactory.createDatasetListItemQuery(datasets);
    const url =  config.data.sparql + "/?" +
        "format=application%2Fx-json%2Bld&" +
        "timeout=0&" +
        "query=" + encodeURIComponent(sparql);
    return requestJson(url).then((data) => ({
        "datasets": datasets,
        "jsonld": data
    }));
}
