import { start } from "./actions/start"

import { nextTurn } from "./actions/next_turn"

import { generate } from "./actions/generate"

import { addCountry } from "./actions/add_country"
import { removeCountry } from "./actions/remove_country"

export const gameplay = {
  start,

  nextTurn,
  generate,

  addCountry,
  removeCountry,
}