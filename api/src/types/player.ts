import { ISocket } from "./socket";

export interface IPlayer {
  id: string;
  lobby: string | undefined;
  socket: ISocket;
}