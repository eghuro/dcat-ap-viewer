import React from "react";
import {PropTypes} from "prop-types";
import {connect} from "react-redux";
import {isLoaderActiveSelector} from "./loading-indicator-reducer";

const _LoaderIndicator = ({active}) => {
  if (active) {
    return (
      <div className="indeterminate-loader fixed-top">
        <div className="progress"/>
      </div>
    )
  } else {
    return null;
  }
};

const LoaderIndicator = connect(
  (state) => ({
    "active": isLoaderActiveSelector(state),
  })
)(_LoaderIndicator);

_LoaderIndicator.propTypes = {
  "active": PropTypes.bool.isRequired,
};

export default LoaderIndicator;
