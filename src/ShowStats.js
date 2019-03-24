import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";

import "react-table/react-table.css";

export default class ShowStats extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    matches: PropTypes.object.isRequired,
    white_list: PropTypes.array.isRequired,
    players: PropTypes.object.isRequired,
  };

  getBasicStats = () => {
    const player_stats = {};

    const { white_list, matches } = this.props;

    white_list.map((steam64Id) => {
      player_stats[steam64Id] = {
        matches: 0,
        rounds: 0,

        rounds_as_t: 0,
        rounds_as_ct: 0,

        kills: 0,
        assists: 0,
        deaths: 0,

        headshots: 0,
        damage: 0,

        time_alive: 0,
        time_alive_on_dead_rounds: 0,

        bomb_plants: 0,
        bomb_defuses: 0,

        "2k": 0,
        "3k": 0,
        "4k": 0,
        "5k": 0,

        entry: 0,
        entry_round_win: 0,
      };
    });

    Object.keys(matches).map((match_id) => {
      const match_data = matches[match_id];

      const team1_player_steam64Ids = Object.keys(match_data.team1_players);
      const team2_player_steam64Ids = Object.keys(match_data.team2_players);

      white_list.map((steam64Id) => {
        if (
          team1_player_steam64Ids.indexOf(steam64Id) !== -1 ||
          team2_player_steam64Ids.indexOf(steam64Id) !== -1
        ) {
          player_stats[steam64Id].matches++;
        }
      });

      match_data.rounds.map((match_round) => {
        const round_length = match_round.round_end_time - match_round.round_start_time;
        Object.keys(match_round.players).map((steam64Id) => {
          if (!player_stats[steam64Id]) {
            return;
          }

          const player_round = match_round.players[steam64Id];

          player_stats[steam64Id].rounds++;

          player_stats[steam64Id].kills += player_round.kills;
          player_stats[steam64Id].headshots += player_round.headshots;
          player_stats[steam64Id].assists += player_round.assists;
          player_stats[steam64Id].damage += player_round.damage;

          if (player_round.time_alive === -1) {
            player_stats[steam64Id].time_alive += round_length;
          } else {
            player_stats[steam64Id].deaths++;
            player_stats[steam64Id].time_alive_on_dead_rounds += player_round.time_alive;
            player_stats[steam64Id].time_alive += player_round.time_alive;
          }

          switch (player_round.kills) {
            case 2:
              player_stats[steam64Id]["2k"]++;
              break;
            case 3:
              player_stats[steam64Id]["3k"]++;
              break;
            case 4:
              player_stats[steam64Id]["4k"]++;
              break;
            case 5:
              player_stats[steam64Id]["5k"]++;
              break;
          }

          const player_in_team1 = team1_player_steam64Ids.indexOf(steam64Id) !== -1;
          const team1_is_t = match_round.t === match_data.team1_name;
          const player_in_team2 = team2_player_steam64Ids.indexOf(steam64Id) !== -1;
          const team2_is_t = match_round.t === match_data.team2_name;

          if ((player_in_team1 && team1_is_t) || (player_in_team2 && team2_is_t)) {
            player_stats[steam64Id].rounds_as_t++;
          } else {
            player_stats[steam64Id].rounds_as_ct++;
          }

          if (player_round.objective) {
            if ((player_in_team1 && team1_is_t) || (player_in_team2 && team2_is_t)) {
              player_stats[steam64Id].bomb_plants++;
            } else {
              player_stats[steam64Id].bomb_defuses++;
            }
          }

          if (player_round.entry) {
            if ((player_in_team1 && team1_is_t) || (player_in_team2 && team2_is_t)) {
              player_stats[steam64Id].entry++;
            }

            if (
              (match_round.winner === match_data.team1_name && player_in_team1 && team1_is_t) ||
              (match_round.winner === match_data.team2_name && player_in_team2 && team2_is_t)
            ) {
              player_stats[steam64Id].entry_round_win++;
            }
          }
        });
      });
    });

    return player_stats;
  };

  getReadableStats = () => {
    const players = this.props.players;
    const player_stats = this.getBasicStats();

    console.table(player_stats);

    return Object.keys(player_stats).map((steam64Id) => {
      const player = player_stats[steam64Id];

      return {
        name: players[steam64Id].name,

        adr: player.damage / player.rounds,

        avg_kills_per_match: player.kills / player.matches,
        avg_assists_per_match: player.assists / player.matches,
        avg_death_per_match: player.deaths / player.matches,

        headshot_percent: player.headshots / player.kills,

        entries_win_percent: player.entry > 0 ? player.entry_round_win / player.entry : 0,
        entries: player.entry,

        bomb_plants: player.bomb_plants,
        bomb_defuses: player.bomb_defuses,

        "2k": player["2k"],
        "3k": player["3k"],
        "4k": player["4k"],
        "5k": player["5k"],
      };
    });
  };

  render() {
    const { loading, matches } = this.props;

    if (loading || Object.keys(matches).length === 0) {
      return null;
    }

    const table_columns = [
      {
        accessor: "name",
        Header: "",
      },
      {
        accessor: "adr",
        Header: "ADR",
        Cell: (props) => props.value.toFixed(2),
      },

      {
        accessor: "avg_kills_per_match",
        Header: "Avg kills",
        Cell: (props) => props.value.toFixed(2),
      },
      {
        accessor: "avg_assists_per_match",
        Header: "Avg assists",
        Cell: (props) => props.value.toFixed(2),
      },
      {
        accessor: "avg_death_per_match",
        Header: "Avg deaths",
        Cell: (props) => props.value.toFixed(2),
      },
      {
        accessor: "headshot_percent",
        Header: "HS %",
        Cell: (props) => `${(props.value * 100.0).toFixed(2)}%`,
      },
      {
        accessor: "entries_win_percent",
        Header: "Entry round win %",
        Cell: (props) => `${(props.value * 100.0).toFixed(2)}%`,
      },
      {
        accessor: "entries",
        Header: "Entry kills",
      },
      {
        accessor: "bomb_plants",
        Header: "Bomb plants",
      },
      {
        accessor: "bomb_defuses",
        Header: "Bomb defuses",
      },
      {
        accessor: "2k",
        Header: "2k",
      },
      {
        accessor: "3k",
        Header: "3k",
      },
      {
        accessor: "4k",
        Header: "4k",
      },
      {
        accessor: "5k",
        Header: "5k",
      },
    ];

    console.log("recorded data");
    console.table(this.props.matches);

    const player_stats = this.getReadableStats();

    console.log("parsed data");
    console.table(player_stats);

    return (
      <ReactTable
        data={player_stats}
        columns={table_columns}
        showPagination={false}
        showPageSizeOptions={false}
        pageSizeOptions={[]}
        defaultPageSize={9}
        defaultSortDesc={true}
      />
    );
  }
}
