import {EliteJournal} from "./_EliteJournal";

export interface FSSSignalDiscovered extends EliteJournal {
    timestamp: string,
    event: "FSSSignalDiscovered",
    SystemAddress: bigint,
    SignalName: string,
    SignalName_Localised?: string,
    USSType?: string,
    USSType_Localised?: string,
    SpawningState?: string,
    SpawningState_Localised?: string,
    SpawningFaction?: string,
    SpawningFaction_Localised?: string,
    ThreatLevel?: number,
    TimeRemaining?: number
}