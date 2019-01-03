import {fetchJson} from "app-services/http-request";
import {nameCountArrayToJsonLd} from "app-services/solr";

export function fetchPublishers() {
    const url = "./api/v1/publishers";
    return fetchJson(url).then((response) => {
        return nameCountArrayToJsonLd(response.json.publishers);
    });
}
