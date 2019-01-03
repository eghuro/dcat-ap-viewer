import {fetchLabel} from "@/app-services/labels";
import {fetchJson} from "@/app-services/http-request";

export function fetchDistributionDetail(iri) {
    const url = "./api/v1/resource/distribution?iri=" + encodeURI(iri);
    return fetchJson(url).then((response) => ({
        "@graph": response.json.json["jsonld"]
    }));
}

// TODO Generalize and merge.
export function fetchLabelsForDistribution(entity, dispatch) {
    const iri = entity["@id"];
    const properties = ["format", "mediaType"];
    properties.forEach((property) => {
        const value = entity[property];
        if (value === undefined) {
            return;
        } else if (Array.isArray(value)) {
            for (let index in value) {
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