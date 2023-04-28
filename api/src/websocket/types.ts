import { z } from "zod";
import {
  chatMessageSchema,
  joinLobbySchema,
  joinSlotSchema,
  updateLobbySchema
} from "./schemas";

/**
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

export interface ServerToClientEvents {

}

export interface ClientToServerEvents {
  "create-lobby": (data: {}, callback: (lobbyId: string) => void) => void;
  "join-lobby": (data: z.infer<typeof joinLobbySchema>, callback: (status: boolean) => void) => void;
  "leave-lobby": () => void;
  "lobby-update": (data: z.infer<typeof updateLobbySchema>) => void;

  "join-slot": (data: z.infer<typeof joinSlotSchema>) => void;
  "leave-slot": () => void;

  "chat-message": (data: z.infer<typeof chatMessageSchema>) => void;
  "sync-state": () => void;

  "game-action": () => void;
}