import {register} from "../../../client/app/register";
import {DATASET_DETAIL_RELATIONSHIPS} from "../nkod-component-names";
import {PropTypes} from "prop-types";
import React from "react";

function Label({item, language}) {
    if ("label" in item) {
        return <a href={item.iri}>{item.label[language]}</a>
    } else {
        return <a href={item.iri}>{item.iri}</a>
    }
}

function ProfileListing({selector, labels, relationship, language}) {
    if (selector in relationship.index.profile) {
        return (
            <div>
                {labels[language]}
                <ul>
                    {relationship.index.profile[selector].map((item) =><li key={item.iri}><Label item={item} language={language}/></li>)}
                </ul>
            </div>
        );
    } else {
        return null;
    }
}

function Relationships({t, relationship, language}) {
    if (!relationship) return null;
    if (!relationship.ready) return null;
    return (
        <div className="row">
            <div class="col">
                <h3>{{"cs": "Související datové sady", "en": "Related datasets"}[language]}</h3>
                <ul>
                    {relationship.index.related.map((item) => <li key={item.iri}><Label item={item} language={language}/></li>)}
                </ul>
            </div>
            <div class="col">
                <ProfileListing selector={"concepts"} labels={{"cs": "Koncepty", "en": "Concepts"}} relationship={relationship} language={language} />
                <ProfileListing selector={"schemata"} labels={{"cs": "Schémata", "en": "Schemata"}} relationship={relationship} language={language} />
                <ProfileListing selector={"classes"} labels={{"cs": "Třídy", "en": "Classes"}} relationship={relationship} language={language} />
                <ProfileListing selector={"predicates"} labels={{"cs": "Predikáty", "en": "Predicates"}} relationship={relationship} language={language} />
                {{"cs": "Celkem triplů", "en": "Total triples"}[language]}: {relationship.index.profile.triples}
            </div>
        </div>
    )
}

Relationships.propTypes = {
    "t": PropTypes.func.isRequired,
    "relationship": PropTypes.object.isRequired,
    "language": PropTypes.string.isRequired
};

Label.propTypes = {
    "item": PropTypes.object.isRequired,
    "language": PropTypes.string.isRequired
};

register({
    "name": DATASET_DETAIL_RELATIONSHIPS,
    "element": Relationships,
});