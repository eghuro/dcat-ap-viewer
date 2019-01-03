import {
    addLoaderStatusOn,
    addLoaderStatusOff
} from "app-ui/loading-indicator/index";
import {fetchPublishers} from "./publisher-api";
import reducer from "./publisher-reducer";

export const FETCH_PUBLISHERS_REQUEST = "FETCH_PUBLISHERS_REQUEST";
export const FETCH_PUBLISHERS_SUCCESS = "FETCH_PUBLISHERS_SUCCESS";
export const FETCH_PUBLISHERS_FAILED = "FETCH_PUBLISHERS_FAILED";

export function fetchPublisherList() {
    return (dispatch, getState) => {
        const state = getState()[reducer.name];
        if (state.allFetched) {
            return;
        }
        dispatch(fetchRequest());
        fetchPublishers()
            .then((payload) => dispatch(fetchSuccess(payload)))
            .catch((error) => dispatch(fetchFailed(error)));
    };
}

function fetchRequest() {
    return addLoaderStatusOn({
        "type": FETCH_PUBLISHERS_REQUEST
    });
}

function fetchSuccess(data) {
    return addLoaderStatusOff({
        "type": FETCH_PUBLISHERS_SUCCESS,
        "publishers": data
    });
}

function fetchFailed(error) {
    console.error("Can't fetch publishers.", error);
    return addLoaderStatusOff({
        "type": FETCH_PUBLISHERS_FAILED,
        "error": error
    });
}
