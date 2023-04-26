import { IGameData } from "./gamedata";

import { generate } from "./gameplay/generate";
import { createCountry } from "./lib/country";
import { util } from "./lib/util";
import { CountryId } from "./types/country_id";

function start(data: IGameData) {
  const firstCountry = data.countries[0];
  if (!firstCountry) return;

  data.running = true;
  data.turn.type = util.countryToTurnType(firstCountry);
}

function pause(data: IGameData) {

}

function resume(data: IGameData) {

}

function stop(data: IGameData) {

}

function nextTurn(data: IGameData) {

}

function addCountry(data: IGameData, country: CountryId) {
  const existing = data.countries.filter(c => c.id === country).length > 0;
  if (existing) return;
  data.countries.push(createCountry(country));
}

function removeCountry(data: IGameData, country: CountryId) {
  data.countries = data.countries.filter(c => c.id !== country);
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