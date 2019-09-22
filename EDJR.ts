export type eventType =
  "Location" | 'FSDTarget' | 'FSDJump' | 'StartJump' |
  'Scan' |
  'FSSAllBodiesFound' | 'FSSDiscoveryScan' | 'FSSSignalDiscovered' |
  'SAAScanComplete' | 'SAASignalsFound'| string;

export class EDJR{
  
  protected listen_events = [
    'Location', 'FSDTarget','FSDJump','StartJump',
    'Scan',
    'FSSAllBodiesFound','FSSDiscoveryScan','FSSSignalDiscovered',
    'SAAScanComplete','SAASignalsFound'
  ];
  
  protected system_properties: {
    name: String,
    scan_progress: Number,
    _events: Array<EliteJournal>
  };
  
  public LogEvent(data: EliteJournal){
    if (this.listen_events.indexOf(data.event) >= 0) {
      this.system_properties._events.push(data);
      return true;
    }
    return false;
  }

  //<editor-fold desc="Event Processes">
  public Location(data: EliteJournal){
    this.system_properties.name = data.StarSystem
  }
  public FSDTarget(data: EliteJournal){}
  public StartJump(data: EliteJournal){}
  public FSDJump(data: EliteJournal){
    this.system_properties.name = data.StarSystem
  }
  public Scan(data: EliteJournal){}
  public FSSAllBodiesFound(data: EliteJournal){}
  public FSSDiscoveryScan(data: EliteJournal){}
  public FSSSignalDiscovered(data: EliteJournal){}
  public SAAScanComplete(data: EliteJournal){}
  public SAASignalsFound(data: EliteJournal){}
  //</editor-fold>
  
}

declare interface EliteJournal {
  timestamp: String
  event?: eventType, 
  StarSystem?: String
}