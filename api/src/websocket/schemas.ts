import { ActionId } from "@core/types/action_id";
import { CountryId } from "@core/types/country_id";
import { z } from "zod";
import { constants } from "../types/constants";

export const joinLobbySchema = z.object({
  lobbyId: z.string().trim().length(constants.lobbyIdLength),
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
// Normally core game requires countryId with the actions, but here
// since the server is authorative, server pick countryId from player itself.
export const actionStartSchema = z.object({}).strict();

export const actionNextTurnSchema = z.object({}).strict();

export const actionGenerateSchema = z.object({
  w: z.number(),
  h: z.number(),
  seed: z.number(),
}).strict();

export const actionAddCountrySchema = z.object({}).strict();

export const actionRemoveCountrySchema = z.object({}).strict();

export const actionPlaceBannerSchema = z.object({
  pos: z.object({
    x: z.number(),
    y: z.number(),
  }).strict(),
}).strict();

export const actionMoveUnitSchema = z.object({
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