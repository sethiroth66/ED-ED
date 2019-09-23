import {EliteJournal} from "./_EliteJournal";

export interface Fileheader extends EliteJournal {
    timestamp: String
    event: "Fileheader",
    part: number,
    language: string
    gameversion: string,
    build: string
}