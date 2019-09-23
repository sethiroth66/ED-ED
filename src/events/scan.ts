import {EliteJournal} from "./_EliteJournal";

export interface Scan extends EliteJournal {
    timestamp: string,
    event: "Scan",
    ScanType: "AutoScan" | "Detailed",
    BodyName: string,
    BodyID: number,
    Parents: Array< { number } >,
    StarSystem: string,
    SystemAddress: bigint,
    DistanceFromArrivalLS: number,
    WasDiscovered: boolean,
    WasMapped: boolean,
    // The rest are optional for planets/moons, do not apply to belt cluster?
    TidalLock?: boolean,
    TerraformState?: string,
    PlanetClass?: string,
    Atmosphere?: string,
    AtmosphereType?: string,
    Volcanism?: string,
    MassEM?: number,
    Radius?: number,
    SurfaceGravity?: number,
    SurfaceTemperature?: number,
    SurfacePressure?: number,
    Landable?: true,
    Materials?: Array<{ Name: string, Percent: number }>
    Composition?: { "Ice": number, "Rock": number, "Metal": number },
    SemiMajorAxis?: number,
    Eccentricity?: number,
    OrbitalInclination?: number,
    Periapsis?: number,
    OrbitalPeriod?: number,
    RotationPeriod?: number,
    AxialTilt?: number
}