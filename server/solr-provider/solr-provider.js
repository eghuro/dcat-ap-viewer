const {handleApiError} = require("./../http-utils");
const {executeSolrQuery} = require("./solr-api");
const {measureTime} = require("../logging-utils");

const DEFAULT_FACET_RETURN_COUNT = 32;

(function initialize() {
  module.exports = {
    "createProvider": createProvider,
  };
})();

function createProvider(configuration) {
  return {
    "v1-info": createV1InfoGet(configuration),
    "v2-dataset-list": measureTime("dataset-list",
      createV2DatasetListGet(configuration)),
    "v2-dataset-facet": createV2DatasetFacetGet(configuration),
    "v2-dataset-typeahead": createV2DatasetTypeaheadGet(configuration),
    "v2-publisher-list": createV2PublisherListGet(configuration),
  }
}

function createV1InfoGet(configuration) {
  return (req, res) => {
    let language = req.query.language || configuration["default-language"];
    collectStatistics(configuration, language)
      .then(statistics => {
        const responseJson = {
          "data": {
            "numberOfDatasets": statistics["count"]["datasets"],
            "numberOfPublishers": statistics["count"]["publishers"],
            "numberOfKeywords": statistics["count"]["keywords"],
          },
        };
        res.json(responseJson);
      })
      .catch(error => {
        handleApiError(res, error);
      });
  };
}

function collectStatistics(configuration, language) {
  const url = configuration.url
    + "/query?q=*:*"
    + "&rows=0"
    + "&facet=true"
    + "&facet.field=keyword_" + language + ""
    + "&facet.field=publisher"
    + "&facet.limit=-1";
  return executeSolrQuery(
    url, content => solrResponseToStatistics(content, language));
}

function solrResponseToStatistics(content, language) {
  const facetFields = content["facet_counts"]["facet_fields"];
  return {
    "count": {
      "datasets": content["response"]["numFound"],
      "publishers": facetFields["publisher"].length / 2,
      "keywords": facetFields["keyword_" + language].length / 2,
    },
  }
}

function createV2DatasetListGet(configuration) {
  return (req, res) => {
    const [params, query] = buildDatasetSolrQuery(
      req.query, configuration["default-language"]);
    const url = configuration.url + "/query?" + params;
    executeSolrQuery(url,
      (content) => solrResponseToDatasets(
        content, query, configuration["languages"]))
      .then(data => responseJsonLd(res, data))
      .catch(error => handleApiError(res, error));
  };
}

function responseJsonLd(res, data) {
  res.setHeader("Content-Type", "application/ld+json");
  res.end(JSON.stringify(data));
}

function buildDatasetSolrQuery(query, defaultLanguage) {
  let userQuery = {
    ...defaultUserQuery(defaultLanguage),
    ...parseDatasetUserQuery(query),
  };
  if (query.text) {
    userQuery["text"] = encodeURIComponent(escapeSolrQueryForText(query.text));
  }
  //
  let sort;
  if (userQuery.sortBy === "title") {
    sort = userQuery.sortBy + "_" + userQuery.language + "_sort "
      + userQuery.sortOrder;
  } else {
    sort = userQuery.sortBy + " " + userQuery.sortOrder;
  }
  let url = "facet.field=keyword_" + userQuery.language + "&"
    + "facet.field=format&"
    + "facet.field=publisher&"
    + "facet.field=theme&"
    + "facet.sort=count&"
    + "facet=true&"
    + "facet.limit=-1&"
    + "facet.mincount=1&"
    + "sort=" + encodeURIComponent(sort) + "&"
    + "q=" + userQuery.text + "";
  url += paginationToSolrQuery(userQuery);
  url += facetsToSolrQuery(userQuery);
  url += temporalToSolrQuery(userQuery);
  return [url, userQuery];
}

function defaultUserQuery(language) {
  return {
    "text": "*",
    "sortBy": "title",
    "sortOrder": "asc",
    "keyword": [],
    "keywordLimit": DEFAULT_FACET_RETURN_COUNT,
    "publisher": [],
    "publisherLimit": DEFAULT_FACET_RETURN_COUNT,
    "format": [],
    "formatLimit": DEFAULT_FACET_RETURN_COUNT,
    "theme": [],
    "themeLimit": DEFAULT_FACET_RETURN_COUNT,
    "temporalStart": undefined,
    "temporalEnd": undefined,
    "offset": 0,
    "limit": 10,
    "language": language,
  }
}

function parseDatasetUserQuery(query) {
  const result = {};
  if (query.sort) {
    const [by, order] = query.sort.split(" ", 2);
    result["sortBy"] = by;
    result["sortOrder"] = order;
  }
  addUserQueryFacet(query, result, "keyword");
  addUserQueryFacet(query, result, "keywordLimit");
  addUserQueryFacet(query, result, "publisher");
  addUserQueryFacet(query, result, "publisherLimit");
  addUserQueryFacet(query, result, "format");
  addUserQueryFacet(query, result, "formatLimit");
  addUserQueryFacet(query, result, "theme");
  addUserQueryFacet(query, result, "themeLimit");
  addUserQueryValue(query, result, "temporal-start");
  addUserQueryValue(query, result, "temporal-end");
  addUserQueryValue(query, result, "offset");
  addUserQueryValue(query, result, "limit");
  addUserQueryValue(query, result, "language");
  return result;
}

function addUserQueryFacet(query, result, name) {
  if (query[name]) {
    if (Array.isArray(query[name])) {
      result[name] = query[name];
    } else {
      result[name] = [query[name]];
    }
  }
}

function addUserQueryValue(query, result, name) {
  if (query[name]) {
    result[name] = query[name];
  }
}

/**
 * TODO Describe and clarify difference to 'escapeSolrQueryValue'.
 */
function escapeSolrQueryForText(text) {
  text = escapeSolrQueryValue(text);

  const tokens = text.trim().split(" ")
    .filter(item => !isEmpty(item))
    .filter(isSpecialCharacter);
  if (tokens.length === 0) {
    return "";
  }

  let solrQuery = "_text_:*" + tokens[0] + "*";
  for (let index = 1; index < tokens.length; ++index) {
    solrQuery += " AND _text_:*" + tokens[index] + "*";
  }

  return solrQuery;
}

function isEmpty(value) {
  return value === undefined || value === null || value.length === 0;
}

function isSpecialCharacter(value) {
  return value[0] !== "\\" || value.length !== 2;
}

function escapeSolrQueryValue(text) {
  text = text.toLocaleLowerCase();

  const charactersToEscape = /([!*+=<>&|{}^~?[\]:"])/g;
  text = text.replace(charactersToEscape, "\\$1");

  // Escape control words (and, or, not).
  text = text.replace("and", "\\and");
  text = text.replace("or", "\\or");
  text = text.replace("not", "\\not");

  return text;
}

function paginationToSolrQuery(userQuery) {
  return "&start=" + userQuery["offset"] + "&rows=" + userQuery["limit"];
}

function facetsToSolrQuery(userQuery) {
  let url = "";

  userQuery.keyword.forEach((item) => {
    url += "&fq=keyword_" + userQuery.language
      + ":\"" + encodeURIComponent(item) + "\""
  });

  userQuery.publisher.forEach((item) => {
    url += "&fq=publisher:\"" + encodeURIComponent(item) + "\""
  });

  userQuery.format.forEach((item) => {
    url += "&fq=format:\"" + encodeURIComponent(item) + "\""
  });

  userQuery.theme.forEach((item) => {
    url += "&fq=theme:\"" + encodeURIComponent(item) + "\""
  });

  return url;
}

function temporalToSolrQuery(userQuery) {
  let url = "";
  if (userQuery["temporal-start"] === undefined) {
    if (userQuery["temporal-end"] === undefined) {
      // No temporal limits.
    } else {
      // Only temporal end is set.
      url += "&fq=temporal-start:%5B+*+TO+"
        + userQuery["temporal-end"]
        + "T00%5C:00%5C:00Z+%5D";
    }
  } else {
    if (userQuery["temporal-end"] === undefined) {
      // Only temporal start is set.
      url += "&fq=temporal-end:%5B+"
        + userQuery["temporal-start"]
        + "T00%5C:00%5C:00Z+TO+*+%5D";
    } else {
      // Both temporal values are set.
      url += "&fq=temporal-start:%5B+*+TO+"
        + userQuery["temporal-start"]
        + "T00%5C:00%5C:00Z+%5D";
      url += "&fq=temporal-end:%5B+"
        + userQuery["temporal-end"]
        + "T00%5C:00%5C:00Z+TO+*+%5D";
    }
  }
  return url;
}

function solrResponseToDatasets(content, query, languagePreferences) {
  const facets = content["facet_counts"]["facet_fields"];
  return {
    "@context": datasetListContext(),
    "@graph": [
      {
        "@type": "Metadata",
        "datasetsCount": content["response"]["numFound"],
      },
      ...content["response"]["docs"].map((item, index) => ({
        "@id": item["iri"],
        "@type": "Dataset",
        "modified": item["modified"],
        "accrualPeriodicity": asResource(item["accrualPeriodicity"]),
        "description": asLiteral(
          item, "description", query.language, languagePreferences),
        "issued": item["issued"],
        "title": asLiteral(item, "title", query.language, languagePreferences),
        "keyword": item["keyword_" + query.language],
        "theme": asResource(item["theme"]),
        "format": asResource(item["format"]),
        "publisher": asResource(item["publisher"]),
        "spatial": asResource(item["spatial"]),
        "order": index,
      })),
      ...convertKeywords(
        facets["keyword_" + query.language], "urn:keyword", query.keywordLimit),
      ...convertFacet(
        facets["format"], "urn:format", query.formatLimit),
      ...convertFacet(
        facets["publisher"], "urn:publisher", query.publisherLimit),
      ...convertFacet(
        facets["theme"], "urn:theme", query.themeLimit),
    ],
  }
}

function datasetListContext() {
  return {
    "dcterms": "http://purl.org/dc/terms/",
    "dcat": "http://www.w3.org/ns/dcat#",
    "Metadata": "urn:DatasetListMetadata",
    "count": "urn:count",
    "Dataset": "dcat:Dataset",
    "modified": "dcterms:modified",
    "accrualPeriodicity": "dcterms:accrualPeriodicity",
    "description": "dcterms:description",
    "issued": "dcterms:issued",
    "title": "dcterms:title",
    "keyword": "dcat:keyword",
    "theme": "dcat:theme",
    "format": "dcterms:format",
    "publisher": "dcterms:publisher",
    "spatial": "dcterms:spatial",
    "Facet": "urn:Facet",
    "facet": "urn:facet",
    "FacetMetadata": "urn:FacetMetadata",
    "code": "urn:code",
    "datasetsCount": "urn:datasetsCount",
    "order": "urn:order",
  };
}

function convertKeywords(values, facetIri, limit) {
  if (!values) {
    return [];
  }
  // We double the limit as solr response have two items per entry.
  if (limit === undefined || (limit * 2) > values.length) {
    limit = values.length;
  } else {
    limit *= 2;
  }
  const result = [];
  for (let index = 0; index < limit; index += 2) {
    const iri = values[index];
    const count = values[index + 1];
    result.push({
      "@type": "Facet",
      "urn:code": iri,
      "facet": {"@id": facetIri},
      "count": count,
    });
  }
  result.push({
    "@type": "FacetMetadata",
    "facet": {"@id": facetIri},
    "count": values.length / 2,
  });
  return result;
}

function convertFacet(values, facetIri, limit) {
  if (!values) {
    return [];
  }
  // We double the limit as solr response have two items per entry.
  if (limit === undefined || (limit * 2) > values.length) {
    limit = values.length;
  } else {
    limit *= 2;
  }
  const result = [];
  for (let index = 0; index < limit; index += 2) {
    const iri = values[index];
    const count = values[index + 1];
    result.push({
      "@type": "Facet",
      "@id": iri,
      "facet": {"@id": facetIri},
      "count": count,
    });
  }
  result.push({
    "@type": "FacetMetadata",
    "facet": {"@id": facetIri},
    "count": values.length / 2,
  });
  return result;
}

function asResource(value) {
  if (Array.isArray(value)) {
    return value.map(item => ({"@id": item}));
  }
  if (value) {
    return {"@id": value};
  } else {
    return undefined;
  }
}

function asLiteral(item, propertyName, language, languagePreferences) {
  const preferredValue = item[propertyName + "_" + language];
  if (!isEmpty(preferredValue)) {
    return {
      "@language": language,
      "@value": preferredValue,
    }
  }
  // Just pick what is available.
  for (let lang of languagePreferences) {
    const value = item[propertyName + "_" + lang];
    if (!isEmpty(value)) {
      return {
        "@language": lang,
        "@value": value,
      }
    }
  }
}

/**
 * This function allows to retrieve all facets for given filters,
 * but no datasets.
 */
function createV2DatasetFacetGet(configuration) {
  return (req, res) => {
    const [params, query] = buildFacetSolrQuery(req.query);
    const url = configuration.url + "/query?" + params;
    executeSolrQuery(url, (content) => solrResponseToFacets(content, query))
      .then(data => responseJsonLd(res, data))
      .catch(error => handleApiError(res, error));
  };
}

function buildFacetSolrQuery(query) {
  let userQuery = {
    ...defaultUserQuery(),
    ...parseDatasetUserQuery(query),
    "facet": "",
    "limit": -1,
  };
  if (query.text) {
    userQuery["text"] = encodeURIComponent(escapeSolrQueryForText(query.text));
  }
  addUserQueryFacet(query, userQuery, "facet");
  addUserQueryFacet(query, userQuery, "limit");
  //
  let params = "facet.field=" + encodeURIComponent(userQuery.facet) + "&"
    + "facet=true&"
    + "facet.limit=-1&"
    + "facet.mincount=1&"
    + "rows=0&"
    + "q=" + userQuery.text + "";
  params += facetsToSolrQuery(userQuery);
  params += temporalToSolrQuery(userQuery);
  return [params, userQuery];
}

function solrResponseToFacets(content, query) {
  const facets = content["facet_counts"]["facet_fields"];
  return {
    "@context": datasetListContext(),
    "@graph": [
      ...convertFacet(
        facets["keyword"], "urn:keyword", query.keywordLimit),
      ...convertFacet(
        facets["format"], "urn:format", query.formatLimit),
      ...convertFacet(
        facets["publisher"], "urn:publisher", query.publisherLimit),
      ...convertFacet(
        facets["theme"], "urn:theme", query.themeLimit),
    ],
  }
}

function createV2DatasetTypeaheadGet(configuration) {
  // default-language
  return (req, res) => {
    const [params, language] =
      buildTypeaheadSolrQuery(req.query, configuration["default-language"]);
    const url = configuration.url + "/query?" + params;
    executeSolrQuery(url, content => solrResponseToTypeaheadDatasets(
      content, language, configuration["default-language"]))
      .then(data => {
        res.json(data);
      })
      .catch(error => {
        handleApiError(res, error);
      });
  };
}

function buildTypeaheadSolrQuery(query, defaultLanguage) {
  let userQuery = {
    ...defaultUserQuery(defaultLanguage),
    ...parseDatasetUserQuery(query),
  };
  if (query.text) {
    userQuery["text"] = encodeURIComponent(escapeSolrQueryValue(query.text));
  }
  //
  let url = "rows=8"
    + "&fl=title_" + query.language + ""
    + "&fl=title_" + defaultLanguage + ""
    + "&fl=iri"
    + "&q=" + userQuery.text + "";
  url += facetsToSolrQuery(userQuery);
  url += temporalToSolrQuery(userQuery);
  return [url, query.language];
}

function solrResponseToTypeaheadDatasets(content, language, defaultLanguage) {
  return {
    "@context": datasetListContext(),
    "@graph": [
      {
        "@type": "Metadata",
        "datasetsCount": content["response"]["numFound"],
      },
      ...content["response"]["docs"]
        .map(item => solrDocToTypeaheadDatasets(
          item, language, defaultLanguage)),
    ],
  };
}

function solrDocToTypeaheadDatasets(doc, language, defaultLanguage) {
  // The language may not be available, in such case
  // we need to use default language.
  let languageToUse;
  if (doc["title_" + language]) {
    languageToUse = language;
  } else {
    languageToUse = defaultLanguage;
  }
  return {
    "@id": doc["iri"],
    "@type": "Dataset",
    "title": {
      "@language": languageToUse,
      "@value": doc["title_" + languageToUse],
    },
  };
}

function createV2PublisherListGet(configuration) {
  return (req, res) => {
    const url = configuration.url
      + "/query?"
      + "facet.field=publisher&"
      + "facet=true&"
      + "facet.mincount=1"
      + "&q=*:*"
      + "&facet.limit=-1"
      + "&rows=0";
    executeSolrQuery(url, solrResponseToPublishers)
      .then(data => responseJsonLd(res, data))
      .catch(error => handleApiError(res, error));
  };
}

function solrResponseToPublishers(content) {
  const facets = content["facet_counts"]["facet_fields"];
  const publishers = facets["publisher"];
  if (!publishers) {
    return [];
  }
  const result = [];
  for (let index = 0; index < publishers.length; index += 2) {
    const iri = publishers[index];
    const count = publishers[index + 1];
    result.push({
      "@type": "http://schema.org/Organization",
      "@id": iri,
      "urn:datasetsCount": count,
    });
  }
  return result;
}