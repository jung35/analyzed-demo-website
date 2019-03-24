import ReactDOM from "react-dom";
import React from "react";

import ShowStyle from "./options/ShowStyle";
import ShowMaps from "./options/ShowMaps";
import ShowStats from "./ShowStats";

import request from "./request";

import "./styles.scss";

const white_list = [
  "76561198020317127", // jung
  "76561198162875654", // tony
  "76561197993761807", // peter
  "76561198033939559", // mike
  "76561198035140517", // jinswag
  "76561198038246134", // sunny
  "76561197987777797", // dennis
  "76561198044967635", // henry
  "76561198018221215", // will
];

class App extends React.Component {
  state = {
    list: null,
    players: {},
    maps: {},
    show_maps: {},
    show_style: "with",
    show_style_values: {},

    matches: {},
    loading: false,
  };

  match_cache = {};

  constructor(props) {
    super(props);

    this.fetchList();
  }

  fetchList = async () => {
    try {
      const response = (await request("./match_datas/list.json")).response;

      this.setState({ list: JSON.parse(response) }, () => this.parseList());
    } catch (err) {
      console.error("ERROR", err);

      return;
    }
  };

  fetchMatch = async (match_id) => {
    if (this.match_cache[match_id]) {
      this.setState(({ matches }) => {
        matches[match_id] = this.match_cache[match_id];

        return { matches };
      });

      return;
    }

    try {
      const response = (await request(`./match_datas/${match_id}`)).response;
      const parsed_data = JSON.parse(response);
      this.match_cache[match_id] = parsed_data;

      this.setState(({ matches }) => {
        matches[match_id] = parsed_data;

        return { matches };
      });
    } catch (err) {
      console.error("ERROR", err);

      return;
    }
  };

  parseList = () => {
    const { list, show_maps, show_style_values } = this.state;

    const maps = {};
    const players = {};

    list.map((match) => {
      if (!maps[match.map]) {
        maps[match.map] = [];
        show_maps[match.map] = true;
      }

      maps[match.map].push(match.data_file);

      Object.keys(match.team1_players).map((steam64Id) => {
        if (!players[steam64Id]) {
          players[steam64Id] = { name: null, matches: [] };
          show_style_values[steam64Id] = white_list.indexOf(steam64Id) !== -1;
        }

        // use latest played steam name
        players[steam64Id].name = match.team1_players[steam64Id];
        players[steam64Id].matches.push(match.data_file);
      });

      Object.keys(match.team2_players).map((steam64Id) => {
        if (!players[steam64Id]) {
          players[steam64Id] = { name: null, matches: [] };
          show_style_values[steam64Id] = white_list.indexOf(steam64Id) !== -1;
        }

        // use latest played steam name
        players[steam64Id].name = match.team2_players[steam64Id];
        players[steam64Id].matches.push(match.data_file);
      });
    });

    this.setState({ maps, players });
  };

  getSelectedMapMatches = () => {
    const { show_maps, maps } = this.state;

    let matches = [];

    Object.keys(show_maps).map((map_name) => {
      if (show_maps[map_name]) {
        matches = matches.concat(maps[map_name]);
      }
    });

    return matches;
  };

  getSelectedPlayerMatches = () => {
    const { players, show_style_values } = this.state;

    let matches = [];
    Object.keys(show_style_values).map((steam64Id) => {
      if (show_style_values[steam64Id]) {
        matches = matches.concat(players[steam64Id].matches);
      }
    });

    return matches;
  };

  getMatchingMatches = () => {
    const show_style = this.state.show_style;

    const map_matches = this.getSelectedMapMatches();
    const player_matches = this.getSelectedPlayerMatches();

    return map_matches
      .map((match_id) => {
        if (
          (show_style === "with" && player_matches.indexOf(match_id) !== -1) ||
          (show_style === "exclude" && player_matches.indexOf(match_id) === -1)
        ) {
          return match_id;
        }
      })
      .filter((f) => f);
  };

  onChangeMap = (show_map) => this.setState({ show_map, matches: {} });
  onChangeStyle = (show_style) => this.setState({ show_style, matches: {} });
  onChangeStyleValue = (show_style_values) => this.setState({ show_style_values, matches: {} });

  onClickGetStats = async () => {
    this.setState({ loading: true, matches: {} });
    const matches = this.getMatchingMatches();

    await Promise.all(
      matches.map((match_id) => {
        return this.fetchMatch(match_id);
      })
    );

    this.setState({ loading: false });
  };

  render() {
    const {
      list,
      players,
      maps,
      show_style,
      show_style_values,
      show_maps,
      matches,
      loading,
    } = this.state;

    if (!list) {
      return "loading stuffs";
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <ShowMaps maps={maps} show_maps={show_maps} onChange={this.onChangeMap} />
            <ShowStyle
              selected_map_matches={this.getSelectedMapMatches()}
              players={players}
              white_list={white_list}
              show_style={show_style}
              show_style_values={show_style_values}
              show_maps={show_maps}
              onChange={this.onChangeStyle}
              onChangeValue={this.onChangeStyleValue}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button
              type="button"
              className="get_stats btn btn-dark"
              onClick={this.onClickGetStats}
              disabled={loading}
            >
              Get stats {loading && <div className="spinner-border" role="status" />}
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <ShowStats
              loading={loading}
              matches={matches}
              white_list={white_list}
              players={players}
            />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
