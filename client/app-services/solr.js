export function parseFacetFromSolrResponse(payload, facetName) {
    const publisher = payload["facet_counts"]["facet_fields"][facetName];
    const output = [];
    for (let index = 0; index < publisher.length; index += 2) {
        output.push({
            "@id": publisher[index],
            "label": publisher[index],
            "count": publisher[index + 1]
        });
    }
    return output;
}


export function nameCountArrayToJsonLd(data) {
    const output = [];
    for (let index = 0; index < data.length; index += 2) {
        output.push({
            "@id": data[index],
            "label": data[index],
            "count": data[index + 1]
        });
    }
    return output;
}
