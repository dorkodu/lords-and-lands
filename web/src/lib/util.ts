import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { game } from "@core/game";
import { ActionId } from "@core/types/action_id";
import { socketio } from "./socketio";
import { bot, IBotSettings } from "@core/lib/bot";
import { IGameData } from "@core/gamedata";
import { DefaultMantineColor } from "@mantine/core";

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
      skipAITurns(s.data);
      s.country = getLocalCountry(s.data);
    }

    // Clear any previous tile selections (excluding hovered tile)
    s.moveableTiles = [];
    s.selectedUnitTile = undefined;

    // Clear "didAction"
    s.didAction = false;
  });
}

function skipAITurns(data: IGameData) {
  const players = useAppStore.getState().lobby.players;

  let currentCountry = game.util.turnTypeToCountryId(data.turn.type);
  let player = players.filter(p => p.country === currentCountry)[0];
  let nonBotPlayerCount = players.filter(p => !p.bot && data.countries.filter(c => c.id === p.country).length).length;

  // If current turn is a bot, make it play it's turn, if no players left in the game, stop
  while (player && player.bot && nonBotPlayerCount > 0) {
    bot.play(data, player.country, player.bot);
    game.play.nextTurn(data, { country: player.country });

    currentCountry = game.util.turnTypeToCountryId(data.turn.type);
    player = players.filter(p => p.country === currentCountry)[0];
    nonBotPlayerCount = players.filter(p => !p.bot && data.countries.filter(c => c.id === p.country).length).length;
  }
}

/**
 * Only use in offline mode, picks the next local country.
 * @param data 
 * @returns 
 */
function getLocalCountry(data: IGameData) {
  const players = useAppStore.getState().lobby.players;

  const country = game.util.turnTypeToCountry(data, data.turn.type);
  if (!country) return undefined;

  const count = players.filter(p => !p.bot && data.countries.filter(c => c.id === p.country).length).length;
  if (count > 0) return country;

  return undefined;
}

function getBotPlayerName(bot: IBotSettings): string {
  switch (bot?.difficulty) {
    case "easy": return "Easy Bot";
    case "normal": return "Normal Bot";
    case "hard": return "Hard Bot";
  }
}

function getBotPlayerColor(bot: IBotSettings): DefaultMantineColor {
  switch (bot.difficulty) {
    case "easy": return "green";
    case "normal": return "yellow";
    case "hard": return "red";
  }
}

function getLocalPlayerName(local: { ownerId: string }): string {
  const players = useAppStore.getState().lobby.players;
  const owner = players.filter(p => p.id === local.ownerId)[0];
  if (!owner) return "";
  return `${owner.name} (Local)`
}

export const util = {
  share,
  copyToClipboard,

  generateId,
  version,

  nextTurn,
  skipAITurns,
  getLocalCountry,

  getBotPlayerName,
  getBotPlayerColor,
  getLocalPlayerName,
}