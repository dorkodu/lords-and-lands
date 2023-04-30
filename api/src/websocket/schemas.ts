import { ActionId } from "@core/types/action_id";
import { CountryId } from "@core/types/country_id";
import { z } from "zod";
import { constants } from "../types/constants";

export const createLobbySchema = z.object({
  playerName: z.string().trim().min(1).max(32),
}).strict();

export const joinLobbySchema = z.object({
  lobbyId: z.string().trim().length(constants.lobbyIdLength),
  playerName: z.string().trim().min(1).max(32),
}).strict();

export const updateLobbySchema = z.object({
  online: z.boolean().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  seed: z.number().optional(),
}).strict();

export const changeCountrySchema = z.object({
  country: z.enum(["green", "purple", "red", "yellow", "none"]),
}).strict();

export const chatMessageSchema = z.object({
  message: z.string().trim().min(0).max(constants.chatMessageLength),
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
  country: z.number().min(CountryId.Green).max(CountryId.Yellow).optional().transform(arg => arg as CountryId),
}).strict();

export const actionGenerateSchema = z.object({
  w: z.number(),
  h: z.number(),
  seed: z.number(),
}).strict();

export const actionAddCountrySchema = z.object({
  country: z.number().min(CountryId.Green).max(CountryId.Yellow),
}).strict();

export const actionRemoveCountrySchema = z.object({
  country: z.number().min(CountryId.Green).max(CountryId.Yellow),
}).strict();

export const actionPlaceBannerSchema = z.object({
  countryId: z.number().min(CountryId.Green).max(CountryId.Yellow),
  pos: z.object({
    x: z.number(),
    y: z.number(),
  }).strict(),
}).strict();

export const actionMoveUnitSchema = z.object({
  countryId: z.number().min(CountryId.Green).max(CountryId.Yellow),
  from: z.object({
    x: z.number(),
    y: z.number(),
  }).strict(),
  to: z.object({
    x: z.number(),
    y: z.number(),
  }).strict(),
}).strict();
// Actions \\