import { ActionId } from "@core/types/action_id";
import { CountryId } from "@core/types/country_id";
import { TurnType } from "@core/types/turn_type";
import { z } from "zod";
import { constants } from "../types/constants";

const countryId = z.number().min(CountryId.Green).max(CountryId.Yellow);
const countryIdAll = z.number().min(CountryId.None).max(CountryId.Yellow);
const turnType = z.number().min(TurnType.None).max(TurnType.Banner);

const playerName = z.string().trim().min(1).max(constants.playerNameLength);
const lobbyId = z.string().trim().length(constants.lobbyIdLength);
const message = z.string().trim().min(1).max(constants.chatMessageLength);

const pos = z.object({ x: z.number(), y: z.number() }).strict();

const width = z.number().min(constants.minMapWidth).max(constants.maxMapWidth);
const height = z.number().min(constants.minMapHeight).max(constants.maxMapHeight);

export const createLobbySchema = z.object({
  playerName: playerName,
}).strict();

export const joinLobbySchema = z.object({
  lobbyId: lobbyId,
  playerName: playerName,
}).strict();

export const lobbyUpdateSchema = z.object({
  online: z.boolean().optional(),
  w: width.optional(),
  h: height.optional(),
  seed: z.number().optional(),
}).strict();

export const changeCountrySchema = z.object({
  country: countryIdAll,
}).strict();

export const chatMessageSchema = z.object({
  message: message,
}).strict();

export const syncStateSchema = z.object({
  w: width,
  h: height,

  mapSeed: z.number(),
  rngSeed: z.number(),
  turnCount: z.number(),
  turnType: turnType,
  running: z.boolean(),

  countries: z.array(
    z.object({ id: z.number(), banners: z.number() }).strict(),
  ).min(constants.minCountries).max(constants.maxCountries),
  tiles: z.array(
    z.object({
      pos: pos,
      owner: z.number(),

      type: z.number(),
      landmark: z.number(),
      unit: z.object({
        id: z.number(),
        attacked: z.boolean(),
        moved: z.boolean()
      }).strict().optional(),
    }).strict()
  ).min(constants.minTiles).max(constants.maxTiles)
  ,
}).strict();

export const gameActionSchema = z.object({
  id: z.enum([
    ActionId.Start,
    ActionId.Pause,
    ActionId.Resume,
    ActionId.Stop,

    ActionId.NextTurn,
    ActionId.Generate,

    ActionId.AddCountry,
    ActionId.RemoveCountry,

    ActionId.PlaceBanner,
    ActionId.MoveUnit,
  ]),
  info: z.any(),
}).strict();



// Actions \\
export const actionStartSchema = z.object({}).strict();

export const actionNextTurnSchema = z.object({
  country: countryId.optional().transform(arg => arg as CountryId),
}).strict();

export const actionGenerateSchema = z.object({
  w: width,
  h: height,
  seed: z.number(),
}).strict();

export const actionAddCountrySchema = z.object({
  country: countryId,
}).strict();

export const actionRemoveCountrySchema = z.object({
  country: countryId,
}).strict();

export const actionPlaceBannerSchema = z.object({
  countryId: countryId,
  pos: pos,
}).strict();

export const actionMoveUnitSchema = z.object({
  countryId: countryId,
  from: pos,
  to: pos,
}).strict();
// Actions \\