import { start } from "./actions/start"

import { nextTurn } from "./actions/next_turn"
import { generate } from "./actions/generate"

import { addCountry } from "./actions/add_country"
import { removeCountry } from "./actions/remove_country"

import { placeBanner, placeBannerActable } from "./actions/place_banner"
import { moveUnit, moveUnitActable } from "./actions/move_unit"

export const gameplay = {
  start,

  nextTurn,
  generate,

  addCountry,
  removeCountry,

  placeBanner,
  placeBannerActable,
  moveUnit,
  moveUnitActable,
}