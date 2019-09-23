import {EliteJournal} from "./_EliteJournal";

export interface FSDJump extends EliteJournal {
  timestamp: String
  event: "FSDJump",
  StarSystem: string,
  SystemAddress: bigint,
  StarPos: Array<number>,
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
  Body: string,
  BodyID: number,
  BodyType: string,
  JumpDist: number,
  FuelUsed: number,
  FuelLevel: number
}
