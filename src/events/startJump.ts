import {EliteJournal} from "./_EliteJournal";

export interface StartJump extends EliteJournal {
    "timestamp": string,
    "event": "StartJump",
    "JumpType": "Hyperspace" | "Supercruise",
    "StarSystem": string,
    "SystemAddress": bigint,
    "StarClass": string
}