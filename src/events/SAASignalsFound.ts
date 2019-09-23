import {EliteJournal} from "./_EliteJournal";

export interface SAASignalsFound extends EliteJournal {
  timestamp: string,
  event: "SAASignalsFound",
  BodyName: string,
  SystemAddress: bigint,
  BodyID: number,
  Signals?: null | Array<{ Type: string, Type_Localised: string, Count: number }>
}
