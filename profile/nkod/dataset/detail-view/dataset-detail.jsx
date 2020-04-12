import React from "react";
import {Link} from "react-router-dom";
import {PropTypes} from "prop-types";
import {register} from "../../../../client/app/register";
import {connect} from "react-redux";
import {
  fetchLabels,
  selectT,
  selectTUrl,
  selectTLabel,
  selectTLiteral,
  getGlobal,
  selectLanguage,
  getRegisteredElement,
  showModal,
  QUERY_DATASET_LIST_PUBLISHER,
  URL_DATASET_LIST,
  ELEMENT_DATASET_DETAIL,
  DEREFERENCE_PREFIX,
} from "../../../client-api";
import {
  fetchQualityDataset,
  selectDatasetQuality,
} from "../../../../client/quality/dataset";
import {fetchRelatedDatasets, selectRelated} from "../../../../client/relationship";
import withStatus from "../../user-iterface/status";
import {selectFormData} from "../../../../client/form/dataset";
import {
  DATASET_DETAIL_FORM_LINKS,
  DATASET_DETAIL_KEYWORDS,
  DATASET_DETAIL_PROPERTIES,
  DATASET_DETAIL_RELATIONSHIPS
} from "../../nkod-component-names";
// TODO Find out how to make this accessible.
import {DistributionList} from "../../../../client/distribution/list";

class DatasetView extends React.PureComponent {

  constructor(props) {
    super(props);
    this.FormLinks = getRegisteredElement(DATASET_DETAIL_FORM_LINKS);
    this.Keywords = getRegisteredElement(DATASET_DETAIL_KEYWORDS);
    this.Properties = getRegisteredElement(DATASET_DETAIL_PROPERTIES);
    this.Relationships = getRegisteredElement(DATASET_DETAIL_RELATIONSHIPS);
  }

  componentDidMount() {
    this.fetchRelatedData();
  }

  fetchRelatedData() {
    this.props.fetchQuality(this.props.dataset.iri);
    this.props.fetchRelationships(this.props.dataset.iri);
    const {dataset, fetchLabels} = this.props;
    const toFetch = [
      dataset.publisher,
      ...asArray(dataset.frequency),
      ...asArray(dataset.spatial),
      ...asArray(dataset.themes),
      ...asArray(dataset.datasetThemes),
    ];
    fetchLabels(toFetch);
  }

  componentDidUpdate(prevProps) {
    if (this.props.dataset !== prevProps.dataset) {
      this.fetchRelatedData();
    }
  }

  render() {
    const {
      t, tUrl, tLabel, tLiteral, dataset, quality,
      language, openModal, form, related
    } = this.props;
    const link = getGlobal(DEREFERENCE_PREFIX) + dataset.iri;
    const {FormLinks, Keywords, Properties, Relationships} = this;

    return (
      <div className="container">
        <h1>
          {tLabel(dataset.iri)}
          <a
            href={link}
            title={t("follow_link")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="material-icons pl-2">open_in_new</i>
          </a>
          <FormLinks
            t={t}
            form={form}
            dataset={dataset}
            language={language}
          />
        </h1>
        <h2>
          <Link to={this.getPublisherSearchLink()}>
            {tLabel(dataset.publisher)}
          </Link>
        </h2>
        <p>{tLiteral(dataset.description)}</p>
        <hr/>
        <Keywords
          t={t}
          tUrl={tUrl}
          keywords={dataset.keywords}
          language={language}
        />
        <Properties
          t={t}
          tLabel={tLabel}
          tUrl={tUrl}
          dataset={dataset}
          quality={quality}
          openModal={openModal}
        />
        <hr/>
        <Relationships
            t={t} /*translations*/
            relationship={related}
            language={language}
        />
        <hr/>
        <DistributionList/>
      </div>
    )
  }

  getPublisherSearchLink() {
    return this.props.tUrl(URL_DATASET_LIST,
      {[QUERY_DATASET_LIST_PUBLISHER]: this.props.dataset.publisher});
  }

}

DatasetView.propTypes = {
  "t": PropTypes.func.isRequired,
  "tUrl": PropTypes.func.isRequired,
  "tLabel": PropTypes.func.isRequired,
  "tLiteral": PropTypes.func.isRequired,
  "fetchLabels": PropTypes.func.isRequired,
  "fetchQuality": PropTypes.func.isRequired,
  "fetchRelationships": PropTypes.func.isRequired,
  "dataset": PropTypes.object.isRequired,
  "language": PropTypes.string.isRequired,
  "quality": PropTypes.object,
  "openModal": PropTypes.func.isRequired,
  "form": PropTypes.object,
  "related": PropTypes.object.isRequired,
};

register({
  "name": ELEMENT_DATASET_DETAIL,
  "element": connect((state) => ({
    "t": selectT(state),
    "tUrl": selectTUrl(state),
    "tLabel": selectTLabel(state),
    "tLiteral": selectTLiteral(state),
    "language": selectLanguage(state),
    "quality": selectDatasetQuality(state),
    "form": selectFormData(state),
    "related": selectRelated(state),
  }), (dispatch) => ({
    "fetchLabels": (iris) => dispatch(fetchLabels(iris)),
    "fetchQuality": (iri) => dispatch(fetchQualityDataset(iri)),
    "fetchRelationships": (iri) => dispatch(fetchRelatedDatasets(iri)),
    "openModal": (body) => dispatch(showModal(undefined, body)),
  }))(withStatus(DatasetView)),
});

function asArray(value) {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}
