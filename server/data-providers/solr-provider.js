const request = require("request");

const config = require("../server-configuration");

module.exports = {
    "getDatasets": getDatasets,
    "getStatistics": getStatistics,
    "getPublishers": getPublishers,
    "getFacets": getFacets,
    "getTypeahead": getTypeahead
};

function getDatasets(req, res) {
    const listStart = req.query.listStart || 0;
    const listRows = req.query.listSize || 10;
    const query = req.query.query;

    let url = config.solr + "/query?" +
        "facet.field=keyword" +
        "&facet.field=formatName" +
        "&facet.field=publisherName" +
        "&facet.field=theme" +
        "&facet=true" +
        "&facet.mincount=1" +
        "&start=" + listStart +
        "&rows=" + listRows +
        "&q=" + encodeURIComponent(escapeSolrQuery(query));

    url += createSolrFilters(req.query);
    request({"url": url}, (error, response, body) => {
        if (isResponseOk(error, response)) {
            const content = JSON.parse(body);
            res.json(solrToDocuments(content));
        } else {
            handleError(res, error);
        }
    });
}

function escapeSolrQuery(query) {
    if (query === undefined || query === "") {
        return "*:*";
    }

    // Convert to lower case.
    query = query.toLocaleLowerCase();

    const charactersToRemove = /[\:\-\\\.\/\[\]]/g;
    query = query.replace(charactersToRemove, " ");

    const charactersToEscape = /([\!\*\+\=\<\>\&\|\{\}\^\~\?"])/g;
    query = query.replace(charactersToEscape, "\\$1");

    // Escape control words (and, or, not).
    query = query.replace("and", "\\and");
    query = query.replace("or", "\\or");
    query = query.replace("not", "\\not");

    // Tokenize string.
    const tokens = query.trim().split(" ")
        .filter(filterEmpty)
        .filter(isSpecialCharacter);

    if (tokens.length === 0) {
        return "";
    }

    let solrQuery = "*" + tokens[0] + "*";
    for (let index = 1; index < tokens.length; ++index) {
        solrQuery += " AND *" + tokens[index] + "*";
    }

    return solrQuery;
}

function filterEmpty(value) {
    return value.length > 0;
}

function isSpecialCharacter(value) {
    return value[0] !== "\\" || value.length !== 2;
}

function createSolrFilters(query) {
    const orderBy = query.orderBy;
    const publishers = asList(query.publisher);
    const themes = asList(query.theme);
    const keywords = asList(query.keyword);
    const formats = asList(query.format);
    const temporalFrom = query.temporalFrom;
    const temporalTo = query.temporalTo;

    let url = "";

    if (orderBy) {
        url += "&sort=" + encodeURIComponent(orderBy);
    }

    publishers.forEach((item) => {
        url += "&fq=publisherName:\"" + encodeURIComponent(item) + "\"";
    });

    themes.forEach((item) => {
        url += "&fq=theme:\"" + encodeURIComponent(item) + "\"";
    });

    keywords.forEach((item) => {
        url += "&fq=keyword:\"" + encodeURIComponent(item) + "\"";
    });

    formats.forEach((item) => {
        url += "&fq=formatName:\"" + encodeURIComponent(item) + "\"";
    });

    if (temporalFrom) {
        if (temporalTo) {
            url += "&fq=temporal-start:%5B+*+TO+" + temporalFrom + "T00%5C:00%5C:00Z+%5D";
            url += "&fq=temporal-end:%5B+" + temporalTo + "T00%5C:00%5C:00Z+TO+*+%5D";
        } else {
            url += "&fq=temporal-end:%5B+" + temporalFrom + "T00%5C:00%5C:00Z+TO+*+%5D";
        }
    } else {
        if (temporalTo) {
            url += "&fq=temporal-start:%5B+*+TO+" + temporalTo + "T00%5C:00%5C:00Z+%5D";
        } else {
            // No limitations.
        }
    }

    return url;
}

function asList(value) {
    if (value === undefined) {
        return [];
    } else if (Array.isArray(value)) {
        return value;
    } else {
        return [value];
    }
}

function solrToDocuments(content) {
    const facets = content["facet_counts"]["facet_fields"];
    return {
        "metadata": {
            "found": content["response"]["numFound"]
        },
        "data": content["response"]["docs"],
        "facets": {
            "publishers": facets["publisherName"],
            "themes": facets["theme"],
            "keywords": facets["keyword"],
            "formats": facets["formatName"]
        }
    }
}

function getStatistics(req, res) {
    const url = config.solr +
        "/query?q=*:*" +
        "&rows=0&" +
        "facet=true" +
        "&facet.field=keyword&" +
        "facet.field=publisherName&" +
        "facet.limit=-1";
    request({"url": url}, (error, response, body) => {
        if (isResponseOk(error, response)) {
            const content = JSON.parse(body);
            res.json(solrToStatistics(content));
        } else {
            handleError(res, error);
        }
    });
}

function isResponseOk(error, response) {
    return error === null && response && response.statusCode === 200;
}

function solrToStatistics(content) {
    const facetFields = content["facet_counts"]["facet_fields"];
    return {
        "data": {
            "numberOfDatasets": content["response"]["numFound"],
            "numberOfPublishers": facetFields["publisherName"].length / 2,
            "numberOfKeywords": facetFields["keyword"].length / 2
        }
    }
}

function handleError(res, error) {
    // TODO Improve logging and error handling #38.
    console.error("Request failed: ", error);
    res.status(500).json({
        "error": "service_request_failed"
    });
}

function getPublishers(req, res) {
    getQueryFacet(res, ["publisherName"],
        (facets) => ({
            "publishers": facets["publisherName"]
        }));
}

function getQueryFacet(res, facets, formatResponse) {
    let url = config.solr +
        "/query?q=*:*" +
        "&rows=0" +
        "&facet=true" +
        "&facet.mincount=1" +
        "&facet.limit=-1";

    facets.forEach((item) => {
        url += "&facet.field=" + item;
    });

    request({"url": url}, (error, response, body) => {
        if (isResponseOk(error, response)) {
            const content = JSON.parse(body);
            const facetFields = content["facet_counts"]["facet_fields"];
            res.json(formatResponse(facetFields));
        } else {
            handleError(res, error);
        }
    });
}

function getFacets(req, res) {
    getQueryFacet(res, ["publisherName", "theme", "keyword", "formatName"],
        (facets) => ({
            "publishers": facets["publisherName"],
            "themes": facets["theme"],
            "keywords": facets["keyword"],
            "formats": facets["formatName"]
        }));
}

function getTypeahead(req, res) {
    const query = req.query.query || "*";

    let url = config.solr +
        "/query?rows=8" +
        "&fl=title" +
        "&q=" + encodeURIComponent(escapeSolrQuery(query));
    url += createSolrFilters(req.query);

    request({"url": url}, (error, response, body) => {
        if (isResponseOk(error, response)) {
            const content = JSON.parse(body);
            res.json({"data": content["response"]["docs"]});
        } else {
            handleError(res, error);
        }
    });
}
