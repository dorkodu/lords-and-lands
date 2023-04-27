import { IGameData } from "./gamedata";

import { generate } from "./gameplay/generate";
import { createCountry } from "./lib/country";
import { util } from "./lib/util";
import { CountryId } from "./types/country_id";
import { TurnType } from "./types/turn_type";

function start(data: IGameData) {
  data.running = true;
  data.turn.type = getTurnType(data, data.turn.count);
}

function pause(data: IGameData) {

}

function resume(data: IGameData) {

}

function stop(data: IGameData) {

}

function nextTurn(data: IGameData) {

}

/**
 * After each country plays for 3 turns, a special turn happens.
 * @param data 
 * @param turn 
 */
function getTurnType(data: IGameData, turn: number): TurnType {
  const countryCount = data.countries.length;
  const specialTurnOffset = countryCount * 3 + 1;
  const turnOffset = (turn - 1) - Math.floor(turn / specialTurnOffset);

  console.log(`turn: ${turn}`)

  if (turn < 0) return TurnType.None;

  if (turn % specialTurnOffset === 0) {
    return TurnType.Banner;
  }
  else {
    return util.countryToTurnType(data.countries[turnOffset % countryCount]);
  }
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
  getTurnType,

  addCountry,
  removeCountry,
}