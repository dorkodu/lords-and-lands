const maxMapWidth = 10;
const minMapWidth = 5;

const maxMapHeight = 10;
const minMapHeight = 5;

const maxCountries = 4;
const minCountries = 2;

export const constants = {
  lobbyIdLength: 10,
  lobbyMaxPlayerCount: 4,

  maxMapWidth,
  minMapWidth,
  maxMapHeight,
  minMapHeight,

  maxCountries,
  minCountries,
  maxTiles: maxMapWidth * maxMapHeight,
  minTiles: minMapWidth * minMapHeight,

  playerNameLength: 32,
  chatMessageLength: 200,
} as const;