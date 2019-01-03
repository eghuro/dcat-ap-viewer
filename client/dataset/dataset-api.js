import {fetchJson} from "app-services/http-request";

export function fetchDatasets(query) {
    let url = "./api/v1/resource/datasets?" +
        "listStart=" + (query.page * query.pageSize) +
        "&listRows=" + query.pageSize;

    if (query.sort === undefined) {
        url += "&orderBy=modified desc";
    } else {
        url += "&orderBy=" + query.sort;
    }

    url += createTextQuery(query);
    url += createFacetsFilter(query);
    url += createTemporalFilter(query);
    return fetchJson(url);
}

function createTextQuery(query) {
    if (query.search !== undefined && query.search !== "") {
        return "&query=" + encodeURIComponent(query.search);
    } else {
        return "";
    }
}

function createFacetsFilter(query) {
    let url = "";

    query.keyword.forEach((item) => {
        url += "&keyword=" + encodeURIComponent(item)
    });

    query.publisher.forEach((item) => {
        url += "&publisher=" + encodeURIComponent(item)
    });

    query.format.forEach((item) => {
        url += "&format=" + encodeURIComponent(item)
    });

    query.theme.forEach((item) => {
        url += "&theme=" + encodeURIComponent(item)
    });

    return url;
}


function createTemporalFilter(query) {
    let url = "";
    if (query.temporalStart && query.temporalStart !== "") {
        url += "&temporalFrom=" + query.temporalStart;
    }
    if (query.temporalEnd && query.temporalEnd !== "") {
        url += "&temporalTo=" + query.temporalEnd;
    }
    return url;
}

export function fetchTitlesForTypeahead(query, text) {
    let url = "./api/v1/typeahead?query=" + encodeURIComponent(text);
    url += createFacetsFilter(query);
    url += createTemporalFilter(query);
    return fetchJson(url);
}
