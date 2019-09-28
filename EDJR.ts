import {EliteJournal} from './src/events/_EliteJournal'
import {Location} from "./src/events/location";
import {FSDTarget} from "./src/events/FSDTarget";
import {StartJump} from "./src/events/startJump";
import {FSDJump} from "./src/events/FSDJump";
import {Scan} from "./src/events/scan";
import {FSSAllBodiesFound} from "./src/events/FSSAllBodiesFound";
import {FSSSignalDiscovered} from "./src/events/FSSSignalDiscovered";
import {SAAScanComplete} from "./src/events/SAAScanComplete";
import {SAASignalsFound} from "./src/events/SAASignalsFound";
// import {Fileheader} from "./src/events/fileheader";

export class EDJR {

  public listen_events= [
    'Location', 'FSDTarget', 'FSDJump', 'StartJump',
    'Scan',
    'FSSAllBodiesFound', 'FSSDiscoveryScan', 'FSSSignalDiscovered',
    'SAAScanComplete', 'SAASignalsFound'
  ];
  public system_properties: {
    name: string,
    scan_progress: number,
    was_discovered?: boolean
    primary_bodies?: number
    _events: Array<EliteJournal>
  };
  public target_system: {
    name: string,
    star_type: string,
    scoopable: boolean | false
  };

  public constructor(name: string) {
    this.system_properties = Object();
    this.system_properties.name = 'Taurus Dark Region EB-X b1-2';
  }
  public getSystemDetails(){
    return this.system_properties
  }

  public logEvent(data: EliteJournal) {
    if (this.listen_events.indexOf(data.event) >= 0) {
      this.system_properties._events.push(data);
      return true;
    }
    return false;
  }

  public getData(){
    return this.system_properties;
  }

  //<editor-fold desc="Event Processes">
  // Location summary when loading game
  public Location(data: Location) {
    this.system_properties.name = data.StarSystem
  }

  // Targeted a system to jump to ( pre StartJump )
  public FSDTarget(data: FSDTarget) {
    this.target_system.name = data.Name;
  }

  // Begun jumping to a system (post FSDTarget, pre FSDJump)
  public StartJump(data: StartJump) {
    this.target_system.name = data.StarSystem;
    this.target_system.star_type = data.StarClass;
    this.target_system.scoopable = !!"KGBFOAM".indexOf(data.StarClass.toUpperCase());
  }

  // Dropped into a system
  public FSDJump(data: FSDJump) {
    this.system_properties.name = data.StarSystem
  }

  public Scan(data: Scan) {
    this.system_properties.name = data.StarSystem
  }

  public FSSAllBodiesFound(data: FSSAllBodiesFound) {
    this.system_properties.name = data.StarSystem
  }

  public FSSDiscoveryScan(data: FSSAllBodiesFound) {
    this.system_properties.name = data.StarSystem
  }

  public FSSSignalDiscovered(data: FSSSignalDiscovered) {
  }

  public SAAScanComplete(data: SAAScanComplete) {
  }

  public SAASignalsFound(data: SAASignalsFound) {
  }

  //</editor-fold>
}
