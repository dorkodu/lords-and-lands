import { game } from "../game";
import { IGameData } from "../gamedata";
import { ActionId } from "../types/action_id";

export function parseAction(data: IGameData, action: { id: ActionId, info?: any }): boolean {
  let actable = false;

  switch (action.id) {
    case ActionId.Start:
      actable = game.play.startActable(data, action.info);
      game.play.start(data, action.info);
      break;
    //case ActionId.Pause: break;
    //case ActionId.Resume: break;
    //case ActionId.Stop: break;

    case ActionId.NextTurn:
      actable = game.play.nextTurnActable(data, action.info);
      game.play.nextTurn(data, action.info);
      break;
    case ActionId.Generate:
      actable = game.play.generateActable(data, action.info);
      game.play.generate(data, action.info);
      break;

    case ActionId.AddCountry:
      actable = game.play.addCountryActable(data, action.info);
      game.play.addCountry(data, action.info);
      break;
    case ActionId.RemoveCountry:
      actable = game.play.removeCountryActable(data, action.info);
      game.play.removeCountry(data, action.info);
      break;

    case ActionId.PlaceBanner:
      actable = game.play.placeBannerActable(data, action.info);
      game.play.placeBanner(data, action.info);
      break;
    case ActionId.MoveUnit:
      actable = game.play.moveUnitActable(data, action.info);
      game.play.moveUnit(data, action.info);
      break;
  }

  return actable;
}