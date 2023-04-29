import { IPlayer } from "./player";

export interface ILobby {
  id: string;
  adminId: string;
  players: Record<string, IPlayer>;
}