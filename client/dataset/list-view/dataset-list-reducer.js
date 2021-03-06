import {
  DATASET_LIST_MOUNT,
  DATASET_LIST_UNMOUNT,
  // DATASET_LIST_SET_VISIBLE_FACETS,
} from "./dataset-list-actions";
import {
  FETCH_DATASET_LIST,
  FETCH_DATASET_LIST_SUCCESS,
  FETCH_DATASET_LIST_FAILED,
} from "../../api/api-action";
import jsonLdToDatasetList from "./jsonld-to-dataset-list";
import {randomColor} from "randomcolor";
import {
  THEMES,
  KEYWORDS,
  PUBLISHERS,
  FORMATS,
} from "../../app/component-list";

const NAME = "dataset-list";

const initialStatus = {
  "mounted": false,
  /**
   * If false a loading dialog is shown.
   */
  "ready": false,
  /**
   * Used to disable user interface during loading.
   */
  "locked": false,
  "error": 0,
  "datasetsCount": undefined,
  "datasets": [],
  "themes": [],
  "themesCount": undefined,
  // "themesVisible": DEFAULT_FACET_SIZE,
  "keywords": [],
  "keywordsCount": undefined,
  // "keywordsVisible": DEFAULT_FACET_SIZE,
  "publishers": [],
  "publishersCount": undefined,
  // "publishersVisible": DEFAULT_FACET_SIZE,
  "formats": [],
  "formatsCount": undefined,
  // "formatsVisible": DEFAULT_FACET_SIZE,
  // We store entities here
  "colors": {},
};

function reducer(state = initialStatus, action) {
  switch (action.type) {
    case DATASET_LIST_MOUNT:
      return onMount(state);
    case DATASET_LIST_UNMOUNT:
      return onUnMount(state);
    // case DATASET_LIST_SET_VISIBLE_FACETS:
    //   return onSetFacetVisibleSize(state, action);
    case FETCH_DATASET_LIST:
      return onFetchDatasetList(state, action);
    case FETCH_DATASET_LIST_SUCCESS:
      return onFetchDatasetListSuccess(state, action);
    case FETCH_DATASET_LIST_FAILED:
      return onFetchDatasetListFailed(state, action);
    default:
      return state;
  }
}

function onMount(state) {
  return {
    ...state,
    "mounted": true,
  }
}

function onUnMount(state) {
  // We keep themes, keywords, publishers and formats.
  return {
    ...state,
    "mounted": false,
    "ready": false,
    "locked": false,
    "error": 0,
    "datasets": [],
  };
}

function onFetchDatasetList(state) {
  return {
    ...state,
    "locked": true,
  }
}

function onFetchDatasetListSuccess(state, action) {
  const data = jsonLdToDatasetList(action.jsonld);
  const colors = {
    ...state.colors,
    ...addColors(data.themes, state.colors),
    ...addColors(data.keywords, state.colors),
  };
  return {
    ...state,
    "ready": true,
    "locked": false,
    "error": 0,
    "datasetsCount": data.datasetsCount,
    "datasets": data.datasets,
    "themes": data.themes,
    "themesCount": data.themesCount,
    "keywords": data.keywords,
    "keywordsCount": data.keywordsCount,
    "publishers": data.publishers,
    "publishersCount": data.publishersCount,
    "formats": data.formats,
    "formatsCount": data.formatsCount,
    "colors": colors,
  }
}

/**
 * Add colors to given entries. Reuse provided colors using iri mapping,
 * return mapping for new colors.
 */
function addColors(items, colors) {
  const newEntries = [];
  items.forEach((item) => {
    if (colors[item.iri]) {
      item["color"] = colors[item.iri];
    } else {
      newEntries.push(item);
    }
  });
  //
  const newColors = {};
  const generatedColors = randomColor({
    "luminosity": "dark",
    "hue": "random",
    "count": items.length,
  });
  for (let index = 0; index < newEntries.length; ++index) {
    const entry = newEntries[index];
    entry["color"] = generatedColors[index];
    newColors[entry.iri] = generatedColors[index];
  }
  return newColors;
}

function onFetchDatasetListFailed(state, action) {
  return {
    ...state,
    "locked": false,
    "error": action.error.code,
  }
}

export default {
  "name": NAME,
  "reducer": reducer,
}

const reducerSelector = (state) => state[NAME];

export function selectReady(state) {
  return reducerSelector(state).ready;
}

export function selectError(state) {
  return reducerSelector(state).error;
}

export function selectDatasetsCount(state) {
  return reducerSelector(state).datasetsCount;
}

export function selectDatasets(state) {
  return reducerSelector(state).datasets;
}

export function selectDatasetListLocked(state) {
  return reducerSelector(state).locked;
}

export function selectFacet(state, type) {
  switch (type) {
    case PUBLISHERS:
      return reducerSelector(state).publishers;
    case THEMES:
      return reducerSelector(state).themes;
    case KEYWORDS:
      return reducerSelector(state).keywords;
    case FORMATS:
      return reducerSelector(state).formats;
    default:
      console.error("Unknown facet type:", type);
      return [];
  }
}

export function selectFacetCount(state, type) {
  state = reducerSelector(state);
  switch (type) {
    case PUBLISHERS:
      return state.publishersCount;
    case THEMES:
      return state.themesCount;
    case KEYWORDS:
      return state.keywordsCount;
    case FORMATS:
      return state.formatsCount;
    default:
      console.error("Unknown facet type:", type);
      return true;
  }
}

export function selectFacetAllFetched(state, type) {
  state = reducerSelector(state);
  switch (type) {
    case PUBLISHERS:
      return state.publishers.length === state.publishersCount;
    case THEMES:
      return state.themes.length === state.themesCount;
    case KEYWORDS:
      return state.keywords.length === state.keywordsCount;
    case FORMATS:
      return state.formats.length === state.formatsCount;
    default:
      console.error("Unknown facet type:", type);
      return true;
  }
}
