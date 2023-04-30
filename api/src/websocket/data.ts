import { ILobby } from "../types/lobby"
import { IPlayer } from "../types/player";
import { ISocket } from "../types/socket";
import { crypto } from "../lib/crypto";
import { constants } from "../types/constants";
import { CountryId } from "@core/types/country_id";
import { createGameData } from "@core/gamedata";
import { ActionId } from "@core/types/action_id";
import { game } from "@core/game";
import { actionAddCountrySchema, actionGenerateSchema, actionMoveUnitSchema, actionNextTurnSchema, actionPlaceBannerSchema, actionRemoveCountrySchema, actionStartSchema } from "./schemas";
import { IActionStart } from "@core/actions/start";
import { IActionNextTurn } from "@core/actions/next_turn";
import { IActionGenerate } from "@core/actions/generate";
import { IActionAddCountry } from "@core/actions/add_country";
import { IActionRemoveCountry } from "@core/actions/remove_country";
import { IActionPlaceBanner } from "@core/actions/place_banner";
import { IActionMoveUnit } from "@core/actions/move_unit";
import { createSeedRandom } from "@core/lib/seed_random";
import { ISerializedGameData } from "@core/serializer";

function createPlayer(socket: ISocket) {
  // Generate random id, if player with id already exists, return
  const id = crypto.id();
  if (data.players[id]) return undefined;

  // Assign new player to data.players & return
  data.players[id] = { id, name: id, lobby: undefined, country: CountryId.None, socket };
  return data.players[id];
}

function removePlayer(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];

  // Delete player from players
  delete data.players[player.id];

  // Check if player is in the lobby, if not don't execute code below
  if (lobby && !lobby.players[player.id]) return;

  // If removed player was the last player in the lobby, remove lobby
  if (lobby && Object.values(lobby.players).length === 1) removeLobby(player);

  // Delete player from lobby.players if exists
  if (lobby) delete lobby.players[player.id];

  // If the removed player is admin, assign another player as admin
  if (lobby && lobby.adminId === player.id) {
    const newAdmin = Object.values(lobby.players)[0];
    if (newAdmin) lobby.adminId = newAdmin.id;
  }
}

function getLobbyPlayers(lobbyId: string | undefined) {
  const lobby = lobbyId && data.lobbies[lobbyId];
  if (!lobby) return [];
  return Object.values(lobby.players);
}

function isPlayerAdmin(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return undefined;
  return player.id === lobby.adminId;
}


function createLobby(player: IPlayer) {
  // If player is already in a lobby
  if (player.lobby) return undefined;

  // Generate id for lobby and check if it already exists
  const id = crypto.id();
  if (data.lobbies[id]) return undefined;

  // Assign player to lobby & lobby to player, then return the lobby
  data.lobbies[id] = { id, adminId: player.id, players: { [player.id]: player }, gameData: createGameData() };
  player.lobby = id;
  return data.lobbies[id];
}

function removeLobby(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return;

  const players = Object.values(lobby.players);

  // Remove lobby
  delete data.lobbies[lobby.id];

  // Remove players' lobby
  players.forEach(p => { p.lobby = undefined });
}

function joinLobby(player: IPlayer, lobbyId: string): ILobby | undefined {
  const lobby = data.lobbies[lobbyId];
  if (!lobby) return undefined;

  // If lobby has less than "lobbyMaxPlayerCount"
  const playerCount = Object.values(lobby.players).length;
  if (playerCount >= constants.lobbyMaxPlayerCount) return undefined;

  lobby.players[player.id] = player;
  player.lobby = lobbyId;

  return lobby;
}

function leaveLobby(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return;

  // Remove country of the player that left
  game.play.removeCountry(lobby.gameData, { country: player.country });

  // If removed player was the last player in the lobby, remove lobby
  if (lobby && Object.values(lobby.players).length === 1) removeLobby(player);

  // If the removed player is admin, assign another player as admin
  if (lobby && lobby.adminId === player.id) {
    const newAdmin = Object.values(lobby.players)[0];
    if (newAdmin) lobby.adminId = newAdmin.id;
  }

  delete data.lobbies[lobby.id]?.players[player.id];
}

function lobbyUpdate(player: IPlayer, width?: number, height?: number, seed?: number): boolean {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return false;

  // If not the admin, can't update lobby
  if (lobby.adminId !== player.id) return false;

  // If game is running, can't change width, height or seed
  if (lobby.gameData.running) return false;

  if (width !== undefined) lobby.gameData.width = width;
  if (height !== undefined) lobby.gameData.height = height;
  if (seed !== undefined) {
    lobby.gameData.rng = createSeedRandom(seed);
    lobby.gameData.seed = seed;
  }

  return true;
}

function changeCountry(player: IPlayer, country: CountryId): { id: string, country: CountryId } | undefined {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return undefined;

  // If game is running, can't change country
  if (lobby.gameData.running) return undefined;

  let oldCountry = player.country;
  let newCountry = CountryId.None;

  switch (country) {
    case CountryId.Green: newCountry = CountryId.Green; break;
    case CountryId.Purple: newCountry = CountryId.Purple; break;
    case CountryId.Red: newCountry = CountryId.Red; break;
    case CountryId.Yellow: newCountry = CountryId.Yellow; break;
    default: break;
  }

  // Check if any other player is using the same country (except CountryId.None)
  let used = false;
  getLobbyPlayers(player.lobby).forEach(p => p.country !== CountryId.None && p.country === newCountry && (used = true));
  if (used) return undefined;

  // Apply country changes to game data
  game.play.removeCountry(lobby.gameData, { country: oldCountry });
  game.play.addCountry(lobby.gameData, { country: newCountry });

  // Set the players country, and return
  player.country = newCountry;
  return { id: player.id, country: newCountry };
}

function syncState(player: IPlayer, state: ISerializedGameData): boolean {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return false;

  // If game is running, can't sync state
  if (lobby.gameData.running) return false;

  // Can't sync state if not admin
  if (lobby.adminId !== player.id) return false;

  // Deserialize & return true
  lobby.gameData = game.serializer.deserialize(state);
  return true;
}

function gameAction(player: IPlayer, action: { id: ActionId, info?: any }, seed: number): boolean {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return false;

  // Some actions require player to be admin, get player's admin status
  const isAdmin = player.id === lobby.adminId;

  // Create new rng at every action to prevent users from cheating
  const oldRng = lobby.gameData.rng;
  const newRng = createSeedRandom(seed);
  lobby.gameData.rng = newRng;

  let actable = false;

  switch (action.id) {
    case ActionId.Start:
      if (!actionStartSchema.safeParse(action.info).success) break;
      const parsedStart = action as IActionStart;

      // Only admin can start the game
      if (!isAdmin) break;

      actable = game.play.startActable(lobby.gameData, parsedStart.info);
      game.play.start(lobby.gameData, parsedStart.info);
      break;
    //case ActionId.Pause: break;
    //case ActionId.Resume: break;
    //case ActionId.Stop: break;

    case ActionId.NextTurn:
      if (!actionNextTurnSchema.safeParse(action.info).success) break;
      const parsedNextTurn = action as IActionNextTurn;
      parsedNextTurn.info.country = player.country;

      actable = game.play.nextTurnActable(lobby.gameData, parsedNextTurn.info);
      game.play.nextTurn(lobby.gameData, parsedNextTurn.info);
      break;
    case ActionId.Generate:
      if (!actionGenerateSchema.safeParse(action.info).success) break;
      const parsedGenerate = action as IActionGenerate;

      // Only admin can generate map
      if (!isAdmin) break;

      actable = game.play.generateActable(lobby.gameData, parsedGenerate.info);
      game.play.generate(lobby.gameData, parsedGenerate.info);
      break;

    case ActionId.AddCountry:
      if (!actionAddCountrySchema.safeParse(action.info).success) break;
      const parsedAddCountry = action as IActionAddCountry;

      actable = game.play.addCountryActable(lobby.gameData, parsedAddCountry.info);
      game.play.addCountry(lobby.gameData, parsedAddCountry.info);
      break;
    case ActionId.RemoveCountry:
      if (!actionRemoveCountrySchema.safeParse(action.info).success) break;
      const parsedRemoveCountry = action as IActionRemoveCountry;

      actable = game.play.removeCountryActable(lobby.gameData, parsedRemoveCountry.info);
      game.play.removeCountry(lobby.gameData, parsedRemoveCountry.info);
      break;

    case ActionId.PlaceBanner:
      if (!actionPlaceBannerSchema.safeParse(action.info).success) break;
      const parsedPlaceBanner = action as IActionPlaceBanner;
      parsedPlaceBanner.info.countryId = player.country;

      actable = game.play.placeBannerActable(lobby.gameData, parsedPlaceBanner.info);
      game.play.placeBanner(lobby.gameData, parsedPlaceBanner.info);
      break;
    case ActionId.MoveUnit:
      if (!actionMoveUnitSchema.safeParse(action.info).success) break;
      const parsedMoveUnit = action as IActionMoveUnit;
      parsedMoveUnit.info.countryId = player.country;

      actable = game.play.moveUnitActable(lobby.gameData, parsedMoveUnit.info);
      game.play.moveUnit(lobby.gameData, parsedMoveUnit.info);
      break;
  }

  // If action is not actable (and not acted), revert the rng
  if (!actable) lobby.gameData.rng = oldRng;

  return actable;
}

export const dataAPI = {
  createPlayer,
  removePlayer,
  getLobbyPlayers,
  isPlayerAdmin,

  createLobby,
  removeLobby,
  joinLobby,
  leaveLobby,
  lobbyUpdate,
  changeCountry,
  syncState,
  gameAction,
}

export const data = {
  lobbies: {} as Record<string, ILobby>,
  players: {} as Record<string, IPlayer>,
}