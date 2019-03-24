import React from "react";
import PropTypes from "prop-types";

export default class ShowStats extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    matches: PropTypes.object.isRequired,
    white_list: PropTypes.array.isRequired,
  };

  getBasicStats = () => {
    const player_stats = {};

    const { white_list, matches } = this.props;

    white_list.map((steam64Id) => {
      player_stats[steam64Id] = {
        kills: 0,
        assists: 0,
        deaths: 0,

        headshots: 0,
        time_alive: 0,

        "2k": 0,
        "3k": 0,
        "4k": 0,
        "5k": 0,

        entry_frags: 0,
        entry_frags_round_win: 0,
      };
    });

    Object.keys(matches).map((match_id) => {
      const match_data = matches[match_id];

      const team1_player_steam64Ids = Object.keys(match_data.team1_players);
      const team2_player_steam64Ids = Object.keys(match_data.team1_players);

      match_data.rounds.map((match_round) => {
        const round_length = match_round.round_end_time - match_round.round_start_time;
        Object.keys(match_round.players).map((steam64Id) => {
          if (!player_stats[steam64Id]) {
            return;
          }

          const player_round = match_round.players[steam64Id];
          player_stats[steam64Id].kills += player_round.kills;
          player_stats[steam64Id].headshots += player_round.headshots;
          player_stats[steam64Id].assists += player_round.assists;

          if (player_round.time_alive === -1) {
            player_stats[steam64Id].time_alive += round_length;
          } else {
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

          if (player_round.entry) {
            player_stats[steam64Id].entry_frags++;

            if (
              (match_round.winner === match_data.team1_name &&
                team1_player_steam64Ids.indexOf(steam64Id) !== -1) ||
              (match_round.winner === match_data.team2_name &&
                team2_player_steam64Ids.indexOf(steam64Id) !== -1)
            ) {
              player_stats[steam64Id].entry_frags_round_win++;
            }
          }
        });
      });
    });

    return player_stats;
  };

  render() {
    const { loading } = this.props;

    if (loading) {
      return "loading stats...";
    }

    console.table(this.props.matches);

    console.table(this.getBasicStats());

    return "stats";
  }
}
