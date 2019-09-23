import {EliteJournal} from "./_EliteJournal";

export interface FSDTarget extends EliteJournal {
  timestamp: string
  event: "FSDTarget"
  Name: string,
  SystemAddress: bigint,
  RemainingJumpsInRoute: number
}
