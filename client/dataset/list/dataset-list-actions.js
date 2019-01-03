import {
    isFetching
} from "@/app-services/http-request";
import {
    addLoaderStatusOn,
    addLoaderStatusOff
} from "@/app-ui/loading-indicator";
import {fetchDatasets} from "../dataset-api";
import {parse as parseQueryString} from "query-string";
import {push} from "react-router-redux";
import {getQuery, PAGE_QUERY} from "@/app/navigation";
import {dataStatusSelector} from "./dataset-list-reducer"
import {fetchLabel} from "@/app-services/labels";

export const FETCH_LIST_PAGE_REQUEST = "FETCH_LIST_PAGE_REQUEST";
export const FETCH_LIST_PAGE_SUCCESS = "FETCH_LIST_PAGE_SUCCESS";
export const FETCH_LIST_PAGE_FAILED = "FETCH_LIST_PAGE_FAILED";
export const SET_LIST_QUERY_STRING = "SET_LIST_QUERY_STRING";

export function fetchData(query) {
    return (dispatch) => {
        dispatch(fetchDataRequest());
        fetchDatasets(query).then((response) => {
            dispatch(fetchDataSuccess(response.json));
            fetchLabels(dispatch, response);
        }).catch((error) => {
            console.log(error);
            dispatch(fetchDataFailed(error));
        });
    };
}

function fetchDataRequest() {
    return addLoaderStatusOn({
        "type": FETCH_LIST_PAGE_REQUEST
    });
}

function fetchDataSuccess(json) {
    return addLoaderStatusOff({
        "type": FETCH_LIST_PAGE_SUCCESS,
        "data": json
    });
}

function fetchDataFailed(error) {
    return addLoaderStatusOff({
        "type": FETCH_LIST_PAGE_FAILED,
        "data": error
    });
}

export function updateQuery(location, updateProperties, unsetProperties) {
    const query = parseQueryString(location.search);
    Object.keys(updateProperties).map((key) => {
        query[getQuery(key)] = updateProperties[key];
    });
    unsetProperties.forEach((key) => query[getQuery(key)] = undefined);
    return pushIfNotPending({
        "pathname": location.pathname,
        "search": createSearchString(query)
    });
}

function createSearchString(query) {
    let search = "";
    Object.keys(query).map((key) => {
        let values = query[key];
        if (values === undefined || values === "") {
            return;
        }
        if (!Array.isArray(values)) {
            values = [values];
        }
        values.forEach((value) => {
            if (search === "") {
                search += "?";
            } else {
                search += "&";
            }
            search += encodeURIComponent(key) + "=" + encodeURIComponent(value);
        });
    });
    return search;
}

function fetchLabels(dispatch, response) {
    const theme = response.json["facets"]["themes"];
    for (let index = 0; index < theme.length; index += 2) {
        dispatch(fetchLabel(theme[index]));
    }
}

function pushIfNotPending(pushObject) {
    // Prevent any location change (action) if we are loading the data.
    return (dispatch, getState) => {
        const state = getState();
        const status = dataStatusSelector(state);
        if (isFetching(status)) {
            return;
        }
        dispatch(push(pushObject));
    };
}

export function updateQueryFilters(location, propName, value, isActive) {
    const params = parseQueryString(location.search);
    const oldValues = asArray(params[getQuery(propName)]);
    const list = updateValueList(value, isActive, oldValues);
    return updateQuery(location, {[propName]: list}, [PAGE_QUERY])
}

function asArray(values) {
    if (values === undefined) {
        return [];
    } else if (Array.isArray(values)) {
        return values;
    } else {
        return [values];
    }
}

function updateValueList(value, isActive, activeList) {
    const output = [...activeList];
    const index = output.indexOf(value);
    if (isActive && index === -1) {
        output.push(value);
    } else if (index > -1) {
        output.splice(index, 1);
    }
    return output;
}

export function clearQuery(location) {
    return pushIfNotPending({
        "pathname": location.pathname,
        "search": ""
    });
}


