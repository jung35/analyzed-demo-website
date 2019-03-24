import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

const sides = { both: "Both sides", t: "Terrorist side only", ct: "Counter-Terrorist side only" };

export default class ShowSide extends React.Component {
  static propTypes = {
    show_side: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const show_side = this.props.show_side;

    return (
      <div className="show_side">
        <label>Choose which side to see</label>
        <ul className="list-group">
          {Object.keys(sides).map((key) => {
            return (
              <li
                key={key}
                className={cx("list-group-item", { active: key === show_side })}
                onClick={() => this.props.onChange(key)}
              >
                {sides[key]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
