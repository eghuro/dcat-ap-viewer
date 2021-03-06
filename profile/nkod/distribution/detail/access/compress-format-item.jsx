import React from "react";
import {PropTypes} from "prop-types"

export default function CompressFormat({t, tLabel, distribution}) {
  if (distribution.compressFormat === undefined) {
    return null;
  }
  const iconStyle = {
    "fontSize": "1.2rem",
    "paddingLeft": "0.5rem",
  };
  return (
    <li className="list-group-item px-2">
      {tLabel(distribution.compressFormat, true)}
      <a
        href={distribution.compressFormat}
        title={t("follow_link")}
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        <i className="material-icons" style={iconStyle}>
          open_in_new
        </i>
      </a>
    </li>
  )
}

CompressFormat.propTypes = {
  "t": PropTypes.func.isRequired,
  "tLabel": PropTypes.func.isRequired,
  "distribution": PropTypes.object.isRequired,
};
