import { z } from "zod";
import {
  changeCountrySchema,
  chatMessageSchema,
  createLobbySchema,
  gameActionSchema,
  joinLobbySchema,
  lobbyUpdateSchema,
  syncStateSchema,
} from "./schemas";
import { CountryId } from "@core/types/country_id";
import { ActionId } from "@core/types/action_id";
import { ISerializedGameData } from "@core/serializer";
import { INetworkPlayer } from "../types/player";

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
  "server-create-lobby": (data: { playerName: string, playerId: string, lobbyId: string, w: number, h: number, seed: number } | undefined) => void;
  "server-join-lobby": (data: { playerId?: string, lobbyId?: string, adminId?: string, w?: number, h?: number, seed?: number, players: INetworkPlayer[] } | undefined) => void;
  "server-leave-lobby": (data: { playerId: string }) => void;
  "server-lobby-update": (data: { adminId?: string, w?: number, h?: number, seed?: number, online?: boolean } | undefined) => void;
  "server-change-country": (data: { id: string, country: CountryId } | undefined) => void;

  "server-chat-message": (data: { id: string; msg: string } | undefined) => void;
  "server-sync-state": (data: { state: ISerializedGameData } | undefined) => void;

  "server-game-action": (data: { id: ActionId, info?: any, seed: number } | undefined) => void;
}

/**
 * 
 */
export interface ClientToServerEvents {
  "client-create-lobby": (data: z.infer<typeof createLobbySchema>) => void;
  "client-join-lobby": (data: z.infer<typeof joinLobbySchema>) => void;
  "client-leave-lobby": () => void;
  "client-lobby-update": (data: z.infer<typeof lobbyUpdateSchema>) => void;
  "client-change-country": (data: z.infer<typeof changeCountrySchema>) => void;

  "client-chat-message": (data: z.infer<typeof chatMessageSchema>) => void;
  "client-sync-state": (data: z.infer<typeof syncStateSchema>) => void;

  "client-game-action": (data: z.infer<typeof gameActionSchema>) => void;
}