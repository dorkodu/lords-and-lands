import { IPlayer } from "./player";

export interface ILobby {
  id: string;
  players: Record<string, IPlayer>;
}