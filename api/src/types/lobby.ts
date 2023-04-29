import { IPlayer } from "./player";
import { IGameData } from "@core/gamedata";

export interface ILobby {
  id: string;
  adminId: string;
  players: Record<string, IPlayer>;

  gameData: IGameData;
}