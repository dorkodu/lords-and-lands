import { z } from "zod";
import { constants } from "../types/constants";

export const joinLobbySchema = z.object({
  lobbyId: z.string().trim().length(constants.lobbyIdLength),
}).strict();

export const updateLobbySchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  seed: z.number().optional(),
}).strict();

export const changeCountrySchema = z.object({
  country: z.enum(["green", "purple", "red", "yellow", "none"]),
}).strict();

export const chatMessageSchema = z.object({
  message: z.string().trim().min(0).max(constants.chatMessageLength),
}).strict();