import { IGameData } from "./gamedata";

import { generate } from "./gameplay/generate";
import { createCountry } from "./lib/country";
import { CountryId } from "./types/country_id";

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

function addCountry(data: IGameData, country: CountryId) {
  const existing = data.countries.filter(c => c.id === country).length > 0;
  if (existing) return;
  data.countries.push(createCountry(country));
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