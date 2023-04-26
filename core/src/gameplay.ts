import { IGameData } from "./gamedata";

import { generate } from "./gameplay/generate";

function start(data: IGameData) {
  const firstCountry = data.countries[0];
  if (!firstCountry) return;

  data.running = true;
  data.turn = { country: firstCountry, count: 0 };
}

function pause() {

}

function resume() {

}

function stop() {

}

function nextTurn() {

}

function addCountry() {

}

function removeCountry() {

}

export const gameplay = {
  start,
  pause,
  resume,
  stop,

  generate,
  nextTurn,

  addCountry,
  removeCountry,
}