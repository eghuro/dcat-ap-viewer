import {fetchJson} from "app-services/http-request";
import {fetchLabel} from "app-services/labels";

export function fetchDatasetDetail(iri) {
    const url = "./api/v1/resource/dataset?iri=" + encodeURI(iri);
    return fetchJson(url).then((response) => ({
        "@graph": response.json.json["jsonld"]
    }));
}

// TODO Generalize and merge with distributions.
export function fetchLabelsForDataset(entity, dispatch) {
    const properties = ["themes", "frequency", "spatial", "datasetThemes"];
    properties.forEach((property) => {
        const value = entity[property];
        if (value === undefined) {
            return;
        } else if (Array.isArray(value)) {
            for (let index in value) {
                if (!value.hasOwnProperty(index)) {
                    continue;
                }
                dispatchLabelRequest(dispatch, value[index]["@id"]);
            }
        } else {
            dispatchLabelRequest(dispatch, value["@id"]);
        }
    });
}

function dispatchLabelRequest(dispatch, iri) {
    dispatch(fetchLabel(iri));
}
