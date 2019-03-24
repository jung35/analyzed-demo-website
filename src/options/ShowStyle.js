import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

export default class ShowStyle extends React.Component {
  static propTypes = {
    selected_map_matches: PropTypes.array.isRequired,
    players: PropTypes.object.isRequired,
    white_list: PropTypes.array.isRequired,
    show_style: PropTypes.oneOf(["with", "exclude"]).isRequired,
    show_style_values: PropTypes.object.isRequired,
    show_maps: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeValue: PropTypes.func.isRequired,
  };

  onClick = (show_style) => {
    if (show_style === this.props.show_style) {
      return;
    }

    this.props.onChange(show_style);

    const { show_style_values, white_list } = this.props;
    Object.keys(show_style_values).map((steam64Id) => {
      if (show_style === "with") {
        show_style_values[steam64Id] = white_list.indexOf(steam64Id) !== -1;
      } else {
        show_style_values[steam64Id] = false;
      }
    });

    this.props.onChangeValue(show_style_values);
  };

  onChangeValue = (steam64Id) => {
    const show_style_values = this.props.show_style_values;
    show_style_values[steam64Id] = !show_style_values[steam64Id];

    this.props.onChangeValue(show_style_values);
  };

  getPlayerMapCount = (steam64Id, get_selected_matches) => {
    const { players } = this.props;

    let count = 0;

    players[steam64Id].matches.map((match_id) => {
      if (get_selected_matches.indexOf(match_id) !== -1) {
        count++;
      }
    });

    return count;
  };

  render() {
    const { show_style, players, white_list, show_style_values, selected_map_matches } = this.props;

    const style_with_players = show_style === "with";

    const sorted_players = Object.keys(players).sort(function(a, b) {
      return players[b].matches.length - players[a].matches.length;
    });

    return (
      <div className="show_style">
        <div className="btn-group btn-group-toggle">
          <label
            className={cx("btn btn-secondary", { active: style_with_players })}
            onClick={() => this.onClick("with")}
          >
            <input type="radio" checked={style_with_players} readOnly /> Matches including selected
            players
          </label>
          <label
            className={cx("btn btn-secondary", { active: !style_with_players })}
            onClick={() => this.onClick("exclude")}
          >
            <input type="radio" checked={!style_with_players} readOnly /> Matches excluding selected
            players
          </label>
        </div>
        <ul className="list-group">
          {sorted_players.map((steam64Id) => {
            if (style_with_players && white_list.indexOf(steam64Id) === -1) {
              return null;
            }

            const count = this.getPlayerMapCount(steam64Id, selected_map_matches);

            if (count === 0) {
              return null;
            }

            const player = players[steam64Id];

            return (
              <li
                key={steam64Id}
                className={cx("list-group-item", { active: show_style_values[steam64Id] })}
                onClick={() => this.onChangeValue(steam64Id)}
              >
                {player.name}

                <span className="badge badge-primary badge-pill">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
