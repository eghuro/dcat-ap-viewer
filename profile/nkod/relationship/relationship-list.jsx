import {register} from "../../../client/app/register";
import {DATASET_DETAIL_RELATIONSHIPS} from "../nkod-component-names";
import {PropTypes} from "prop-types";
import React from "react";


function Checkbox({item, isSelected, onCheckboxChange}) {
    //https://github.com/fedosejev/checkboxes-in-react-16/blob/master/src/components/Checkbox.js
    return (
        <div className="form-check">
            <label>
                <input
                    type="checkbox"
                    name={item.iri}
                    checked={isSelected}
                    onChange={onCheckboxChange}
                    className="form-check-input"
                />
                <a href={item.iri}>{item.iri}</a>
            </label>
        </div>
    );
}

function Label({item, language}) {
    /*if ("label" in item) {
        return <a href={item.iri}>{item.label[language]}</a>
    } else {*/
    return <a href={item.iri}>{item.iri}</a>
    //}
}

function ProfileListing({selector, labels, relationship, language, createElement}) {
    if ((selector in relationship.index.profile) && (relationship.index.profile[selector].length > 0)){
        return (
            <div>
                {labels[language]}
                <ul>
                    {relationship.index.profile[selector].map((item) =>
                        <li key={item.iri}>
                            { createElement(item, language) }
                        </li>
                    )
                    }
                </ul>
            </div>
        );
    } else {
        return null;
    }
}

function RelationsWithCommonResource({relatedList, language, commonKey, selection}) {
    if (!selection[commonKey]) return null;
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

function RelationshipType({indexTypeObject, language, relationshipTypeKey, selection}) {
    let common = Object.keys(indexTypeObject);
    const relationshipTypeLabels = {
        'qb': {
            'cs': 'Shoda na dimenzích statistických datových kostek',
            'en': 'Matching resource on statistical data cube dimension'
        }
    } //this is specific to the indexer

    let relationshipTypeLabel = undefined;
    const keys = Object.keys(relationshipTypeLabels);
    if (keys.includes(relationshipTypeKey)) {
        relationshipTypeLabel = relationshipTypeLabels[relationshipTypeKey][language];
    } else {
        relationshipTypeLabel = relationshipTypeKey;
    }

    if (common.length > 0) {
        return (
            <div>
                <h4>{relationshipTypeLabel}</h4>
                {
                    common.map(
                        (key) => <RelationsWithCommonResource relatedList={indexTypeObject[key]} language={language}
                                                                          commonKey={key} key={key} selection={selection}/>
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


class Relationships extends React.Component {
    constructor(props) {
        super(props);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleDimensionSelectionChange = this.handleDimensionSelectionChange.bind(this);
        this.modifySelection = this.modifySelection.bind(this);
        this.state = {
            'selected': {}
        };
    }

    handleCheckboxChange(event) {
        const { name } = event.target;
        //measure -> nechat jak je
        //dimension -> najit resouces na dimenzi a ty oznacit

        this.setState(prevState => ({
            selected: {
                ...prevState.selected,
                [name]: !prevState.selected[name]
            }
        }))
    }

    modifySelection(prevState, resources, name) {
        let selected = prevState.selected;
        selected[name] = !selected[name]; //this handles the actual checkbox
        resources.forEach((item) => selected[item] = !selected[item]);
        console.log(selected);
        return selected;
    }

    handleDimensionSelectionChange(event) {
        const { name } = event.target;
        const {relationship} = this.props;
        const dimensions = relationship.index.profile.dimensions;

        let resources = [];
        dimensions.forEach((dimension) => {
            if (dimension.iri === name) {
                resources = resources.concat(dimension.resources);
            }
        });

        this.setState(prevState => ({
            selected: this.modifySelection(prevState, resources, name)
        }))
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.relationship.ready) return;
        const {t, relationship, language } = this.props;
        if (!relationship) return;
        if (!relationship.ready) return;

        if (relationship.index.profile.triples > 0) {
            let update = {}
            relationship.index.profile["dimensions"].map((dim) => {
                dim.resources.map((resource) => { update[resource] = true; });
                update[dim.iri] = true; // this handles actual checkbox state
            });
            relationship.index.profile["measures"].map((m) => {
                update[m.iri] = true;
            });

            this.setState(prevState => ({
                selected: {
                    ...prevState.selected,
                    ...update
                }
            }));
        }
    }

    render() {
        const {t, relationship, language } = this.props;

        if (!relationship) return null;
        if (!relationship.ready) return null;

        let relationTypes = Object.keys(relationship.index.related);

        if (relationship.index.profile.triples > 0) {
            let ordinaryFactory = (item, language) => (<Label item={item} language={language}/>);
            let measureCheckboxFactory = (item, language) => (
                <Checkbox
                    item={item}
                    isSelected={this.state.selected[item.iri]}
                    onCheckboxChange={this.handleCheckboxChange}
                    key={item.iri} />
            );
            let dimensionCheckboxFactory = (item, language) => (
                <Checkbox
                    item={item}
                    isSelected={this.state.selected[item.iri]}
                    onCheckboxChange={this.handleDimensionSelectionChange}
                    key={item.iri} />
            );
            return (
                <div className="row">
                    <div className="col">
                        <h3>{{"cs": "Související datové sady", "en": "Related datasets"}[language]}</h3>
                        {relationTypes.map((type) =>
                            <RelationshipType indexTypeObject={relationship.index.related[type]} language={language}
                                              relationshipTypeKey={type} key={type} selection={this.state.selected} />
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
                                        relationship={relationship} language={language} createElement={dimensionCheckboxFactory} />
                        <ProfileListing selector={"measures"} labels={{"cs": "Míry", "en": "Measures"}}
                                        relationship={relationship} language={language} createElement={measureCheckboxFactory} />
                        <ProfileListing selector={"concepts"} labels={{"cs": "Koncepty", "en": "Concepts"}}
                                        relationship={relationship} language={language} createElement={ordinaryFactory} />
                        <ProfileListing selector={"schemata"} labels={{"cs": "Schémata", "en": "Schemata"}}
                                        relationship={relationship} language={language} createElement={ordinaryFactory} />
                        <ProfileListing selector={"classes"} labels={{"cs": "Třídy", "en": "Classes"}}
                                        relationship={relationship} language={language} createElement={ordinaryFactory} />
                        <ProfileListing selector={"predicates"} labels={{"cs": "Predikáty", "en": "Predicates"}}
                                        relationship={relationship} language={language} createElement={ordinaryFactory} />
                        {{"cs": "Celkem triplů", "en": "Total triples"}[language]}: {relationship.index.profile.triples}
                    </div>
                </div>
            )
        } else {
            return null;
        }
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