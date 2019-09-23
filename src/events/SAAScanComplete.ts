import {EliteJournal} from "./_EliteJournal";

export interface SAAScanComplete extends EliteJournal {
  timestamp: string,
  event: "SAAScanComplete",
  BodyName: string,
  SystemAddress: bigint,
  BodyID: number,
  ProbesUsed: number,
  EfficiencyTarget: number
}
