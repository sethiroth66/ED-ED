export type eventType =
  "Location" | 'FSDTarget' | 'FSDJump' | 'StartJump' |
  'Scan' |
  'FSSAllBodiesFound' | 'FSSDiscoveryScan' | 'FSSSignalDiscovered' |
  'SAAScanComplete' | 'SAASignalsFound' | string;

export interface EliteJournal {
  "timestamp": String
  "event"?: eventType,
}


