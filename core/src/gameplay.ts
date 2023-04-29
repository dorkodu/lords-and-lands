import { start, startActable } from "./actions/start"

import { nextTurn, nextTurnActable } from "./actions/next_turn"
import { generate, generateActable } from "./actions/generate"

import { addCountry, addCountryActable } from "./actions/add_country"
import { removeCountry, removeCountryActable } from "./actions/remove_country"

import { placeBanner, placeBannerActable } from "./actions/place_banner"
import { moveUnit, moveUnitActable } from "./actions/move_unit"

export const gameplay = {
  start,
  startActable,

  nextTurn,
  nextTurnActable,
  generate,
  generateActable,

  addCountry,
  addCountryActable,
  removeCountry,
  removeCountryActable,

  placeBanner,
  placeBannerActable,
  moveUnit,
  moveUnitActable,
}