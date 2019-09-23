import {EliteJournal} from "./_EliteJournal";

export interface FSSAllBodiesFound extends EliteJournal {
    StarSystem: string;
    timestamp: string,
    event: "FSSAllBodiesFound",
    SystemName: string,
    SystemAddress: bigint,
    Count: number
}