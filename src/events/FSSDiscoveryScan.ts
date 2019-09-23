import {EliteJournal} from "./_EliteJournal";

export interface FSSDiscoveryScan extends EliteJournal {
  timestamp: string,
  event: "FSSDiscoveryScan",
  Progress: number,
  BodyCount: number,
  NonBodyCount: number,
  SystemName: string,
  SystemAddress: bigint
}
