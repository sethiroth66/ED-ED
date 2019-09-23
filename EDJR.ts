import { EliteJournal } from './src/events/_EliteJournal'
import {Location} from "./src/events/location";
import {FSDTarget} from "./src/events/FSDTarget";
import {StartJump} from "./src/events/startJump";
import {FSDJump} from "./src/events/FSDJump";
import {Scan} from "./src/events/scan";
import {FSSAllBodiesFound} from "./src/events/FSSAllBodiesFound";
import {FSSSignalDiscovered} from "./src/events/FSSSignalDiscovered";
import {SAAScanComplete} from "./src/events/SAAScanComplete";
import {SAASignalsFound} from "./src/events/SAASignalsFound";
import {Fileheader} from "./src/events/fileheader";

export class EDJR{
  
  protected listen_events = [
    'Location', 'FSDTarget','FSDJump','StartJump',
    'Scan',
    'FSSAllBodiesFound','FSSDiscoveryScan','FSSSignalDiscovered',
    'SAAScanComplete','SAASignalsFound'
  ];
  
  protected system_properties: {
    name: string,
    scan_progress: number,
    primary_bodies?: number
    _events: Array<EliteJournal>
  };
  protected next_system: {
    name: string,
    star_type: string,
    scoopable: boolean | false
  };
  
  public LogEvent(data: EliteJournal){
    if (this.listen_events.indexOf(data.event) >= 0) {
      this.system_properties._events.push(data);
      return true;
    }
    return false;
  }

  //<editor-fold desc="Event Processes">
  public Location(data: Location){
    this.system_properties.name = data.StarSystem
  }
  public FSDTarget(data: FSDTarget){
    this.next_system.name = data.Name;
  }
  public StartJump(data: StartJump){
    this.next_system.name = data.StarSystem;
    this.next_system.star_type = data.StarClass;
    this.next_system.scoopable = !!"KGBFOAM".indexOf(data.StarClass.toUpperCase());
  }
  public FSDJump(data: FSDJump){
    this.system_properties.name = data.StarSystem
  }
  public Scan(data: Scan){
    this.system_properties.name = data.StarSystem
  }
  public FSSAllBodiesFound(data: FSSAllBodiesFound){
    this.system_properties.name = data.StarSystem
  }
  public FSSDiscoveryScan(data: FSSAllBodiesFound){
    this.system_properties.name = data.StarSystem
  }
  public FSSSignalDiscovered(data: FSSSignalDiscovered){
  }
  public SAAScanComplete(data: SAAScanComplete){
  }

  public SAASignalsFound(data: SAASignalsFound){
  }
  //</editor-fold>
  
}