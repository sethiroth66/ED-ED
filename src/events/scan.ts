import {EliteJournal} from "./_EliteJournal";

declare type BodyType =
  { "Null": number }
  | { "Star": number }
  | { "Planet": number }
  | { "PlanetaryRing": number }
  | { "StellarRing": number }
  | { "Station": number }
  | { "AsteroidCluster": number };

declare type RingProperties = { Name: string, RingClass: string, MassMT: number, InnerRad: number, OutterRad: number }

export interface Scan extends EliteJournal {
  timestamp: string,
  event: "Scan",
  ScanType: "AutoScan" | "Detailed",
  BodyName: string,
  BodyID: number,
  Parents: Array<BodyType>,
  StarSystem: string,
  SystemAddress: bigint,
  DistanceFromArrivalLS: number,
  WasDiscovered: boolean,
  WasMapped: boolean,

  // Parameters(star)
  StarType?: string
  Subclass?: number
  StellarMass?: number
  Radius?: number
  AbsoluteMagnitude?: number
  RotationPeriod?: number
  SurfaceTemperature?: number
  Luminosity?: string
  Age_MY?: string | number


  // Parameters(Planet/Moon) 
  TidalLock?: boolean,
  TerraformState?: string,
  PlanetClass?: string,
  Atmosphere?: string,
  AtmosphereType?: string,
  AtmosphereComposition?: Array<{ Name: string, Percent: Number }>,
  Volcanism?: string,
  MassEM?: number,
  // Radius?: number,
  SurfaceGravity?: number,
  // SurfaceTemperature?: number,
  SurfacePressure?: number,
  Landable?: true,
  Materials?: Array<{ Name: string, Percent: number }>
  Composition?: { "Ice": number, "Rock": number, "Metal": number },

  // If Rotating: 
  // RotationPeriod?: number,
  AxialTilt?: number

  // Orbital Parameters
  SemiMajorAxis?: number,
  Eccentricity?: number,
  OrbitalInclination?: number,
  Periapsis?: number,
  OrbitalPeriod?: number,

  // If rings present
  Rings?: Array<RingProperties>
  ReserveLevel?: "Pristine" | "Major" | "Common" | "Low" | "Depleted" | string

}
