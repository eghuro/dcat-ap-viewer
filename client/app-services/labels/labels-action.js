import {fetchJson} from "@/app-services/http-request";
import {reducerName} from "./labels-reducer";

export const FETCH_LABEL_SUCCESS = "FETCH_LABEL_SUCCESS";

export const fetchLabel = (iri) => {
    const url = "./api/v1/resource/codelist?iri=" + encodeURIComponent(iri);
    return (dispatch, getState) => {
        const state = getState()[reducerName];
        if (state[iri]) {
            // We already have the data.
            return;
        }
        fetchJson(url).then((data) => {
            dispatch(fetchLabelSuccess({"@graph": data.json["jsonld"]}));
        }).catch((error) => {
            console.warn("Label request failed for: ", iri, " error:", error);
        });
    }
};

function fetchLabelSuccess(jsonld) {
    return {
        "type": FETCH_LABEL_SUCCESS,
        "jsonld": jsonld
    }
}