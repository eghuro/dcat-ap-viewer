import {fetchJsonCallback} from "../../services/http-request";
import {setApplicationLoader} from "../../application/app-action";
import Notifications from "react-notification-system-redux";
import {getString} from "./../../application/strings";

export const FETCH_KEYWORDS_REQUEST = "FETCH_KEYWORDS_REQUEST";
export const FETCH_KEYWORDS_SUCCESS = "FETCH_KEYWORDS_SUCCESS";
export const FETCH_KEYWORDS_FAILED = "FETCH_KEYWORDS_FAILED";

function constructQueryUrl() {
    let url = "api/v1/solr/query?" +
        "facet.field=keyword&" +
        "facet=true&" +
        "facet.mincount=" + KEYWORD_CLOUD_MIN_COUNT + "&" +
        "q=*:*&" +
        "facet.limit=-1";
    return url;
}

export function fetchKeywordsRequest() {
    return (dispatch) => {
        dispatch({
            "type": FETCH_KEYWORDS_REQUEST,
        });
        const url = constructQueryUrl();
        dispatch(setApplicationLoader(true));
        fetchJsonCallback(url, (json) => {
            dispatch(setApplicationLoader(false));
            dispatch(fetchKeywordsSuccess(json));
        }, (error) => {
            dispatch(setApplicationLoader(false));
            dispatch(fetchKeywordsFailed(error));
            // TODO Move to fetchJson service
            dispatch(Notifications.error({
                "uid": "e.serviceOffline",
                "title": getString("e.serviceOffline"),
                "position": "tr",
                "autoDismiss": 4,
            }));
        });
    };
}

function fetchKeywordsSuccess(json) {
    return {
        "type": FETCH_KEYWORDS_SUCCESS,
        "data": json
    };
}

function fetchKeywordsFailed(error) {
    return {
        "type": FETCH_KEYWORDS_FAILED,
        "data": error
    };
}
