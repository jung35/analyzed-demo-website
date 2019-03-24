import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import cx from "classnames";

import "react-table/react-table.css";

import getMatchStats from "./getMatchStats";

import "./styles.scss";

const table_columns = [
  { accessor: "name", Header: "" },
  { accessor: "matches", Header: "#" },
  { accessor: "adr", Header: "ADR", Cell: (props) => props.value.toFixed(2) },

  { accessor: "avg_kills", Header: "K", Cell: (props) => props.value.toFixed(2) },
  { accessor: "avg_assists", Header: "A", Cell: (props) => props.value.toFixed(2) },
  { accessor: "avg_deaths", Header: "D", Cell: (props) => props.value.toFixed(2) },

  {
    accessor: "headshot_percent",
    Header: "HS %",
    Cell: (props) => `${props.value.toFixed(2)}%`,
  },
  {
    accessor: "entries_win_percent",
    Header: "Entry win %",
    Cell: (props) => `${props.value.toFixed(2)}%`,
  },
  { accessor: "entries", Header: "Entry kills" },
  {
    accessor: "entries_per_match",
    Header: "Entry per match",
    Cell: (props) => props.value.toFixed(2),
  },
  { accessor: "bomb_plants", Header: "Bomb plants" },
  { accessor: "bomb_defuses", Header: "Bomb defuses" },
  { accessor: "2k", Header: "2k" },
  { accessor: "3k", Header: "3k" },
  { accessor: "4k", Header: "4k" },
  { accessor: "5k", Header: "5k" },
];

const default_columns = [
  "name",
  "matches",
  "adr",
  "avg_kills",
  "avg_assists",
  "avg_deaths",
  "headshot_percent",
  "entries_win_percent",
  // "entries",
  // "bomb_plants",
  // "bomb_defuses",
  "2k",
  "3k",
  "4k",
  "5k",
];

export default class OverallStats extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    show_side: PropTypes.string.isRequired,
    matches: PropTypes.object.isRequired,
    white_list: PropTypes.array.isRequired,
    players: PropTypes.object.isRequired,
  };

  state = { columns: {} };

  constructor(props) {
    super(props);

    table_columns.map((column) => {
      this.state.columns[column.accessor] = default_columns.indexOf(column.accessor) !== -1;
    });
  }

  getReadableStats = () => {
    const { players, white_list, matches, show_side } = this.props;
    const player_stats = getMatchStats({ white_list, matches, team_type: show_side });

    console.table(player_stats);

    return Object.keys(player_stats).map((steam64Id) => {
      const player = player_stats[steam64Id];

      return {
        name: players[steam64Id].name,
        matches: player.matches,

        adr: player.damage / player.rounds,

        avg_kills: player.kills / player.matches,
        avg_assists: player.assists / player.matches,
        avg_deaths: player.deaths / player.matches,

        headshot_percent: (100.0 * player.headshots) / player.kills,

        entries_win_percent: player.entry > 0 ? (100.0 * player.entry_round_win) / player.entry : 0,
        entries: player.entry,
        entries_per_match: player.entry / player.matches,

        bomb_plants: player.bomb_plants,
        bomb_defuses: player.bomb_defuses,

        "2k": player["2k"],
        "3k": player["3k"],
        "4k": player["4k"],
        "5k": player["5k"],
      };
    });
  };

  onChangeColumn = (column) => {
    this.setState((state) => {
      const columns = state.columns;
      columns[column] = !columns[column];

      return { columns };
    });
  };

  render() {
    const { loading, matches } = this.props;

    if (loading || Object.keys(matches).length === 0) {
      return null;
    }

    console.clear();

    console.log("recorded data");
    console.table(this.props.matches);

    const player_stats = this.getReadableStats();

    console.log("parsed data");
    console.table(player_stats);

    const columns = this.state.columns;
    const active_columns = Object.keys(columns)
      .map((column) => (columns[column] ? table_columns.find((c) => c.accessor === column) : null))
      .filter((v) => v);

    return (
      <>
        <div className="show_columns">
          <label>Table columns</label>
          <ul className="list-group">
            {Object.keys(this.state.columns).map((column) => {
              const column_info = table_columns.find((c) => c.accessor === column);
              if (column_info.Header.length < 1) {
                return null;
              }

              return (
                <li
                  key={column_info.accessor}
                  className={cx("list-group-item", { active: columns[column] })}
                  onClick={() => this.onChangeColumn(column)}
                >
                  {column_info.Header}
                </li>
              );
            })}
          </ul>
        </div>
        <ReactTable
          className="OverallStats -highlight -striped"
          data={player_stats}
          columns={active_columns}
          showPagination={false}
          showPageSizeOptions={false}
          pageSizeOptions={[]}
          defaultPageSize={9}
          defaultSortDesc={true}
        />
      </>
    );
  }
}
