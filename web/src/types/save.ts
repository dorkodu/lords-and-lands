import { ISerializedGameData } from "@core/serializer";

export interface ISave {
  name: string;
  date: number;
  data: ISerializedGameData;
}