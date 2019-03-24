const playerInitStatsTeam = () => ({
  rounds: 0,
  round_wins: 0,

  kills: 0,
  assists: 0,
  deaths: 0,

  "2k": 0,
  "3k": 0,
  "4k": 0,
  "5k": 0,

  headshots: 0,
  damage: 0,

  time_alive: 0,
  time_alive_on_dead_rounds: 0,

  bomb_plants: 0,
  bomb_defuses: 0,

  entry: 0,
  entry_time: 0,
  entry_time_fastest: -1,
  entry_time_slowest: -1,
  entry_round_win: 0,

  first_blood: 0,
  first_blood_time: 0,
  first_blood_time_fastest: -1,
  first_blood_time_slowest: -1,
  first_blood_round_lose: 0,
});

const playerInitStats = () => ({
  matches: 0,
  t: playerInitStatsTeam(),
  ct: playerInitStatsTeam(),
});

const getBasicStats = ({ white_list, matches, team_type }) => {
  const player_stats = {};

  white_list.map((steam64Id) => {
    player_stats[steam64Id] = playerInitStats();
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

        const player_in_team1 = team1_player_steam64Ids.indexOf(steam64Id) !== -1;
        const player_in_team2 = team2_player_steam64Ids.indexOf(steam64Id) !== -1;

        const team1_is_t = match_round.t === match_data.team1_name;
        const team2_is_t = match_round.t === match_data.team2_name;

        const side =
          (player_in_team1 && team1_is_t) || (player_in_team2 && team2_is_t) ? "t" : "ct";

        const player_round = match_round.players[steam64Id];

        /**
         * rounds
         * round_wins
         */
        player_stats[steam64Id][side].rounds++;
        if (
          (match_round.winner === match_data.team1_name && player_in_team1) ||
          (match_round.winner === match_data.team2_name && player_in_team2)
        ) {
          player_stats[steam64Id][side].round_wins++;
        }

        /**
         * kills
         * headshots
         * assists
         * damage
         */
        player_stats[steam64Id][side].kills += player_round.kills;
        player_stats[steam64Id][side].headshots += player_round.headshots;
        player_stats[steam64Id][side].assists += player_round.assists;
        player_stats[steam64Id][side].damage += player_round.damage;

        /**
         * time_alive
         * deaths
         * time_alive_on_dead_rounds
         */
        if (player_round.time_alive === -1) {
          player_stats[steam64Id][side].time_alive += round_length;
        } else {
          player_stats[steam64Id][side].deaths++;
          player_stats[steam64Id][side].time_alive_on_dead_rounds += player_round.time_alive;
          player_stats[steam64Id][side].time_alive += player_round.time_alive;
        }

        /**
         * 2k
         * 3k
         * 4k
         * 5k
         */
        player_stats[steam64Id][side][`${player_round.kills}k`]++;

        /**
         * bomb_plants
         * bomb_defuses
         */
        if (player_round.objective) {
          if (side === "t") {
            player_stats[steam64Id][side].bomb_plants++;
          } else {
            player_stats[steam64Id][side].bomb_defuses++;
          }
        }

        /**
         * entry
         * entry_round_win
         * entry_time
         * entry_time_fastest
         * entry_time_slowest
         */
        if (player_round.entry) {
          player_stats[steam64Id][side].entry++;
          player_stats[steam64Id][side].entry_time += player_round.entry_time;

          if (player_stats[steam64Id][side].entry_time_fastest === -1) {
            player_stats[steam64Id][side].entry_time_fastest = player_round.entry_time;
            player_stats[steam64Id][side].entry_time_slowest = player_round.entry_time;
          }

          if (player_round.entry_time < player_stats[steam64Id][side].entry_time_fastest) {
            player_stats[steam64Id][side].entry_time_fastest = player_round.entry_time;
          }

          if (player_round.entry_time > player_stats[steam64Id][side].entry_time_slowest) {
            player_stats[steam64Id][side].entry_time_slowest = player_round.entry_time;
          }

          if (
            (match_round.winner === match_data.team1_name && player_in_team1) ||
            (match_round.winner === match_data.team2_name && player_in_team2)
          ) {
            player_stats[steam64Id][side].entry_round_win++;
          }
        }
      });
    });
  });

  const parsed_stats = {};

  if (team_type === "ct") {
    Object.keys(player_stats).map((steam64Id) => {
      const player = player_stats[steam64Id];

      parsed_stats[steam64Id] = player.ct;
      parsed_stats[steam64Id].matches = player.matches;
    });
  }

  if (team_type === "t") {
    Object.keys(player_stats).map((steam64Id) => {
      const player = player_stats[steam64Id];

      parsed_stats[steam64Id] = player.t;
      parsed_stats[steam64Id].matches = player.matches;
    });
  }

  if (team_type === "both") {
    Object.keys(player_stats).map((steam64Id) => {
      const player = player_stats[steam64Id];

      parsed_stats[steam64Id] = {
        matches: player.matches,
        rounds: player.ct.rounds + player.t.rounds,
        round_wins: player.ct.round_wins + player.t.round_wins,

        kills: player.ct.kills + player.t.kills,
        assists: player.ct.assists + player.t.assists,
        deaths: player.ct.deaths + player.t.deaths,

        "2k": player.ct["2k"] + player.t["2k"],
        "3k": player.ct["3k"] + player.t["3k"],
        "4k": player.ct["4k"] + player.t["4k"],
        "5k": player.ct["5k"] + player.t["5k"],

        headshots: player.ct.headshots + player.t.headshots,
        damage: player.ct.damage + player.t.damage,

        time_alive: player.ct.time_alive + player.t.time_alive,
        time_alive_on_dead_rounds:
          player.ct.time_alive_on_dead_rounds + player.t.time_alive_on_dead_rounds,

        bomb_plants: player.ct.bomb_plants + player.t.bomb_plants,
        bomb_defuses: player.ct.bomb_defuses + player.t.bomb_defuses,

        entry: player.ct.entry + player.t.entry,
        entry_time: player.ct.entry_time + player.t.entry_time,
        entry_time_fastest: Math.min(player.ct.entry_time_fastest, player.t.entry_time_fastest1),
        entry_time_slowest: Math.max(player.ct.entry_time_slowest, player.t.entry_time_slowest1),
        entry_round_win: player.ct.entry_round_win + player.t.entry_round_win,

        first_blood: player.ct.first_blood + player.t.first_blood,
        first_blood_time: player.ct.first_blood_time + player.t.first_blood_time,
        first_blood_time_fastest: Math.min(
          player.ct.first_blood_time_fastest,
          player.t.first_blood_time_fastest1
        ),
        first_blood_time_slowest: Math.max(
          player.ct.first_blood_time_slowest,
          player.t.first_blood_time_slowest1
        ),
        first_blood_round_lose: player.ct.first_blood_round_lose + player.t.first_blood_round_lose,
      };
    });
  }

  return parsed_stats;
};

export default getBasicStats;
