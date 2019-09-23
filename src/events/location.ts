import {EliteJournal} from "./_EliteJournal";

export interface Location extends EliteJournal {
    timestamp: String
    event: "Location",
    StarSystem: string,
    SystemAddress: bigint,
    StarPos?: Array<number>,
    Body: string,
    BodyID: number,
    BodyType: string
    Docked: boolean,
    SystemAllegiance: string,
    SystemEconomy: string,
    SystemEconomy_Localised: string,
    SystemSecondEconomy: string,
    SystemSecondEconomy_Localised: string,
    SystemGovernment: string,
    SystemGovernment_Localised: string,
    SystemSecurity: string,
    SystemSecurity_Localised: string,
    Population: number,
}