import { z } from "zod";
import {
  chatMessageSchema,
  joinLobbySchema,
  joinSlotSchema,
  updateLobbySchema
} from "./schemas";

export interface ServerToClientEvents {

}

export interface ClientToServerEvents {
  "create-lobby": () => void;
  "join-lobby": (data: z.infer<typeof joinLobbySchema>) => void;
  "leave-lobby": () => void;
  "lobby-update": (data: z.infer<typeof updateLobbySchema>) => void;

  "join-slot": (data: z.infer<typeof joinSlotSchema>) => void;
  "leave-slot": () => void;

  "chat-message": (data: z.infer<typeof chatMessageSchema>) => void;
  "sync-state": () => void;

  "game-action": () => void;
}