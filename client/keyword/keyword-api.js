import {fetchJson} from "app-services/http-request";

export function fetchKeywordsByPublishers() {
    const url = "./api/v1/keywordsByPublishers";
    return fetchJson(url).then((response) => {
        return response.json.json;
    });
}