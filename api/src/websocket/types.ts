import { z } from "zod";
import {
  changeCountrySchema,
  chatMessageSchema,
  joinLobbySchema,
  updateLobbySchema
} from "./schemas";
import { IPlayer } from "../types/player";
import { CountryId } from "@core/types/country_id";

/**
 * Client sends "client-x" event. After server processes it,
 * server sends to all/to 1/to all except 1 of the same event
 * with the name "server-x" event. Server might send "server-x"
 * events without first receiving "client-x" event also.
 * 
 * --- Events
 * Create lobby
 * Join lobby
 * Leave lobby
 * Lobby update
 * 
 * Join slot
 * Leave slot
 * 
 * Chat message
 * Sync state
 * 
 * Game action
 */

/**
 * 
 */
export interface ServerToClientEvents {
  "server-create-lobby": (data: { playerId: string, lobbyId: string } | undefined) => void;
  "server-join-lobby": (data: { players: IPlayer[] } | undefined) => void;
  "server-leave-lobby": (data: { playerId: string }) => void;
  "server-lobby-update": (data: { w?: number, h?: number, seed?: number, online?: boolean } | undefined) => void;
  "server-change-country": (data: { id: string, country: CountryId } | undefined) => void;

  "server-chat-message": () => void;
  "server-sync-state": () => void;

  "server-game-action": () => void;
}

/**
 * 
 */
export interface ClientToServerEvents {
  "client-create-lobby": () => void;
  "client-join-lobby": (data: z.infer<typeof joinLobbySchema>) => void;
  "client-leave-lobby": () => void;
  "client-lobby-update": (data: z.infer<typeof updateLobbySchema>) => void;
  "client-change-country": (data: z.infer<typeof changeCountrySchema>) => void;

  "client-chat-message": (data: z.infer<typeof chatMessageSchema>) => void;
  "client-sync-state": () => void;

  "client-game-action": () => void;
}