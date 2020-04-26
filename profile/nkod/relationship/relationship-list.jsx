import {register} from "../../../client/app/register";
import {DATASET_DETAIL_RELATIONSHIPS} from "../nkod-component-names";
import {PropTypes} from "prop-types";
import React from "react";

function Label({item, language}) {
    /*if ("label" in item) {
        return <a href={item.iri}>{item.label[language]}</a>
    } else {*/
    return <a href={item.iri}>{item.iri}</a>
    //}
}

function ProfileListing({selector, labels, relationship, language}) {
    if ((selector in relationship.index.profile) && (relationship.index.profile[selector].length > 0)){
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

function RelationsWithCommonResource({relatedList, language, commonKey}) {
    if (relatedList.length > 0) {
        return (<div>
            <h5>{commonKey}</h5>
            <ul>
                {relatedList.map((related) => <li key={related}><a href={related}>{related}</a></li>)}
            </ul>
        </div>)
    } else {
        return null;
    }
}

function RelationshipType({indexTypeObject, language, relationshipTypeKey}) {
    let common = Object.keys(indexTypeObject);

    if (common.length > 0) {
        return (
            <div>
                <h4>{relationshipTypeKey}</h4>
                {
                    common.map(
                        (key) => <RelationsWithCommonResource relatedList={indexTypeObject[key]} language={language}
                    commonKey={key} key={key} />
                    )
                }
            </div>
        )
    } else {
        return null;
    }
}

function Badge({texts, language}) {
    if (texts === undefined) return null;
    return (<span className="badge badge-pill badge-primary"> {texts[language]} </span>)
}

function DatasetBadges({relationship, labels, language}) {
    let dataset_badges = relationship.index.profile.classes.map((clazz) => {
        const iri = clazz.iri;
        if (labels.hasOwnProperty(iri)) return labels[iri];
    })

    if (dataset_badges.length > 0) {
        return (
            <div>
                { <Badge texts={labels[null]} language={language} /> }
                { dataset_badges.map((texts) => <Badge texts={texts} language={language} />) }
            </div>
        )
    }
    else return null;
}

function Relationships({t, relationship, language}) {
    if (!relationship) return null;
    if (!relationship.ready) return null;

    let relationTypes = Object.keys(relationship.index.related);

    if (relationship.index.profile.triples > 0) {
        return (
            <div className="row">
                <div className="col">
                    <h3>{{"cs": "Související datové sady", "en": "Related datasets"}[language]}</h3>
                    {relationTypes.map((type) =>
                        <RelationshipType indexTypeObject={relationship.index.related[type]} language={language}
                                          relationshipTypeKey={type} key={type}/>
                    )}
                </div>
                <div className="col">
                    <h3>{{"cs": "Profil datasetu", "en": "Dataset profile"}[language]}</h3>
                    <DatasetBadges relationship={relationship} language={language} labels={{
                        null: {
                            'cs': 'Propojená data',
                            'en': 'Linked data'
                        },
                        'http://purl.org/linked-data/cube#DataSet': {
                            'cs': 'Statistická datová kostka',
                            'en': 'Statistical data cube'
                        },
                        'http://www.w3.org/2004/02/skos/core#ConceptScheme': {
                            'cs': 'Číselník',
                            'en': 'Codelist'
                        }
                    }}/>
                    <ProfileListing selector={"dimensions"} labels={{"cs": "Dimenze", "en": "Dimensions"}}
                                    relationship={relationship} language={language}/>
                    <ProfileListing selector={"measures"} labels={{"cs": "Míry", "en": "Measures"}}
                                    relationship={relationship} language={language}/>
                    <ProfileListing selector={"concepts"} labels={{"cs": "Koncepty", "en": "Concepts"}}
                                    relationship={relationship} language={language}/>
                    <ProfileListing selector={"schemata"} labels={{"cs": "Schémata", "en": "Schemata"}}
                                    relationship={relationship} language={language}/>
                    <ProfileListing selector={"classes"} labels={{"cs": "Třídy", "en": "Classes"}}
                                    relationship={relationship} language={language}/>
                    <ProfileListing selector={"predicates"} labels={{"cs": "Predikáty", "en": "Predicates"}}
                                    relationship={relationship} language={language}/>
                    {{"cs": "Celkem triplů", "en": "Total triples"}[language]}: {relationship.index.profile.triples}
                </div>
            </div>
        )
    } else {
        return null;
    }
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