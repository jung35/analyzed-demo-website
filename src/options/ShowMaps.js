import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

export default class ShowMaps extends React.Component {
  static propTypes = {
    maps: PropTypes.object.isRequired,
    show_maps: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  onChange = (map_name) => {
    const show_maps = this.props.show_maps;

    show_maps[map_name] = !show_maps[map_name];

    this.props.onChange(show_maps);
  };

  render() {
    const { maps, show_maps } = this.props;
    const sorted = Object.keys(maps).sort(function(a, b) {
      return maps[b].length - maps[a].length;
    });

    return (
      <div className="show_maps">
        <ul className="list-group">
          {sorted.map((map_name) => {
            const map_info = maps[map_name];

            return (
              <li
                key={map_name}
                className={cx("list-group-item", { active: show_maps[map_name] })}
                onClick={() => this.onChange(map_name)}
              >
                {map_name}

                <span className="badge badge-primary badge-pill">{map_info.length}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
