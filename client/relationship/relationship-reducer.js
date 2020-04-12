import {
    FETCH_RELATED_DATASETS,
    FETCH_RELATED_DATASETS_SUCCESS,
} from "../api/api-action";

import {
    DATASET_DETAIL_MOUNT,
    DATASET_DETAIL_UNMOUNT,
} from "../dataset/detail-view/dataset-detail-actions";

const initialState = {
    "mounted": false,
    "related": undefined,
};

const NAME = "relationship";

function reducer(state = initialState, action) {
    switch (action["type"]) {
        case FETCH_RELATED_DATASETS:
            return onDatasetRelatedFetch(state);
        case FETCH_RELATED_DATASETS_SUCCESS:
            return onDatasetRelatedFetchSuccess(state, action);
        case DATASET_DETAIL_MOUNT:
            return onDatasetListMount(state);
        case DATASET_DETAIL_UNMOUNT:
            return onDatasetListUnMount(state);
        default:
            return state;
    }
}

function onDatasetRelatedFetch(state) {
    return {
        ...state,
        "relationship": {
            "ready": false
        }
    }
}

function onDatasetRelatedFetchSuccess(state, action) {
    return {
        ...state,
        "relationship": {
            "ready": true,
            ...transform(action)
        }
    }
}

function onDatasetListMount(state) {
    return {
        ...state,
        "mounted": true,
    };
}

function onDatasetListUnMount() {
    return initialState;
}

function transform(action) {
    return {
        "index": action.jsonld.jsonld
    };
}

const reducerSelector = (state) => state[NAME];

export function selectRelated(state) {
    const relationship = reducerSelector(state).relationship;
    if (relationship) {
        return relationship
    }
    return {
        "ready": false
    }
}

export default {
    "name": NAME,
    "reducer": reducer,
};