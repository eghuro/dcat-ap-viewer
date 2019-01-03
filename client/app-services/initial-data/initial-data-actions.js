import {
    addLoaderStatusOn,
    addLoaderStatusOff
} from "app-ui/loading-indicator/index";
import {fetchJson} from "../http-request";
import {nameCountArrayToJsonLd} from "app-services/solr";

export const FETCH_INITIAL_DATA_REQUEST = "FETCH_INITIAL_DATA_REQUEST";
export const FETCH_INITIAL_DATA_SUCCESS = "FETCH_INITIAL_DATA_SUCCESS";
export const FETCH_INITIAL_DATA_FAILED = "FETCH_INITIAL_DATA_FAILED";

export const FETCH_INITIAL_SOLR_REQUEST = "FETCH_INITIAL_SOLR_REQUEST";
export const FETCH_INITIAL_SOLR_SUCCESS = "FETCH_INITIAL_SOLR_SUCCESS";
export const FETCH_INITIAL_SOLR_FAILED = "FETCH_INITIAL_SOLR_FAILED";


export function fetchInitialData() {
    return (dispatch) => {
        fetchFiltersFromCache(dispatch);
        fetchFacetsValues(dispatch);
    };
}

function fetchFiltersFromCache(dispatch) {
    dispatch(fetchDataRequest());
    const url = "./api/v1/prefetch";
    return fetchJson(url)
        .then((payload) => dispatch(fetchDataSuccess(payload.json.json)))
        .catch((error) => dispatch(fetchDataFailed(error)));
}


function fetchDataRequest() {
    return addLoaderStatusOn({
        "type": FETCH_INITIAL_DATA_REQUEST
    });
}

function fetchDataSuccess(data) {
    return addLoaderStatusOff({
        "type": FETCH_INITIAL_DATA_SUCCESS,
        "$publishers": data.publishers,
        "$themes": data.themes.map((theme) => ({
            "@id": theme["@id"]
        })),
        "$keywords": data.keywords,
        // Only themes contains labels.
        "$labels": data.themes
    });
}

function fetchDataFailed(error) {
    console.error("Can't fetch initial data.", error);
    return addLoaderStatusOff({
        "type": FETCH_INITIAL_DATA_FAILED,
        "error": error
    });
}

function fetchFacetsValues(dispatch) {
    dispatch(fetchSolrRequest());
    const url = "./api/v1/facets";
    fetchJson(url)
        .then((payload) => dispatch(fetchSolrSuccess(payload.json)))
        .catch((error) => dispatch(fetchSolrFailed(error)));
}

function fetchSolrRequest() {
    return addLoaderStatusOn({
        "type": FETCH_INITIAL_SOLR_REQUEST
    });
}

function fetchSolrSuccess(response) {
    const publishers = nameCountArrayToJsonLd(response["publishers"]);
    const themes = nameCountArrayToJsonLd(response["themes"]);
    const keywords = nameCountArrayToJsonLd(response["keywords"]);
    const formats = nameCountArrayToJsonLd(response["formats"]);
    return addLoaderStatusOff({
        "type": FETCH_INITIAL_SOLR_SUCCESS,
        "$publishers": publishers,
        "$themes": themes,
        "$keywords": keywords,
        "$formats": formats,
        "$labels": []
    });
}

function fetchSolrFailed(error) {
    console.error("Can't fetch initial solr data.", error);
    return addLoaderStatusOff({
        "type": FETCH_INITIAL_SOLR_FAILED,
        "error": error
    });
}
