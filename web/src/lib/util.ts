import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { ActionId } from "@core/types/action_id";
import { socketio } from "./socketio";

function share(text: string, url: string): Promise<boolean> {
  return new Promise(resolve => {
    if (navigator.share) {
      navigator.share({ text, url })
        .catch(() => resolve(false))
        .then(() => resolve(true))
    } else {
      resolve(false);
    }
  })
}

function copyToClipboard(text: string): Promise<boolean> {
  return new Promise(resolve => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .catch(() => resolve(false))
        .then(() => resolve(true))
    }
    else {
      resolve(false);
    }
  })
}

/**
 * Generates 4 characters of base 36 random id using Math.random().
 * @returns 
 */
function generateId() {
  return Math.random().toString(36).substring(2, 2 + 4);
}

function version(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);
  return `version ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date)}`;
}

function nextTurn() {
  const online = useAppStore.getState().lobby.online;

  useGameStore.setState(s => {
    if (online) {
      // If next turn action is actable
      if (game.play.nextTurnActable(s.data, { country: s.country?.id })) {
        socketio.emit("client-game-action", { id: ActionId.NextTurn, info: {} });
      }
    }
    else {
      game.play.nextTurn(s.data, { country: s.country?.id });
      s.country = game.util.turnTypeToCountry(s.data, s.data.turn.type);
    }

    // Clear any previous tile selections (excluding hovered tile)
    s.moveableTiles = [];
    s.selectedUnitTile = undefined;

    // Clear "didAction"
    s.didAction = false;
  });
}

export const util = {
  share,
  copyToClipboard,

  generateId,
  version,

  nextTurn,
}