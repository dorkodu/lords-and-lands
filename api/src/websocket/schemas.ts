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

export const createLobbySchema = z.object({
  playerName: playerName,
}).strict();

export const joinLobbySchema = z.object({
  lobbyId: lobbyId,
  playerName: playerName,
}).strict();

export const lobbyUpdateSchema = z.object({
  online: z.boolean().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  seed: z.number().optional(),
}).strict();

export const changeCountrySchema = z.object({
  country: countryIdAll,
}).strict();

export const chatMessageSchema = z.object({
  message: message,
}).strict();

export const syncStateSchema = z.object({
  w: z.number(),
  h: z.number(),

  mapSeed: z.number(),
  rngSeed: z.number(),
  turnCount: z.number(),
  turnType: turnType,

  countries: z.array(
    z.object({ id: z.number(), banners: z.number() }).strict(),
  ),
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
  ),
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
  w: z.number(),
  h: z.number(),
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