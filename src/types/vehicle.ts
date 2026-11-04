export type VehicleType = 
  | 'Pickup 4x4'
  | 'Cargo Van'
  | 'Sedan'
  | 'Heavy Box Truck'
  | 'Staff Shuttle / Bus'
  | 'Emergency Response';

export type VehicleStatus = 
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'MAINTENANCE'
  | 'GROUNDED';

export type VehicleCondition = 
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Attention Required';

export interface OrgVehicle {
  id: string;
  fleetNumber: string; // e.g. "FL-01", "VAN-04"
  plateNumber: string; // e.g. "KDA 829X"
  makeModel: string;   // e.g. "Toyota Hilux 2.8 D-4D"
  year: number;
  type: VehicleType;
  assignedDepartment: string;
  status: VehicleStatus;
  currentOdometer: number; // in km
  fuelLevelPercent: number; // 0 - 100
  lastInspectionDate: string;
  condition: VehicleCondition;
  assignedDriver?: string;
  notes?: string;
}

export interface PreTripChecklist {
  lightsOk: boolean;
  tiresConditionOk: boolean;
  bodyScratchesChecked: boolean;
  interiorClean: boolean;
  spareWheelToolsPresent: boolean;
  safetyTrianglesFireExtinguisher: boolean;
  fuelConfirmed: boolean;
  remarks?: string;
}

export interface PostTripChecklist {
  exteriorDamageFree: boolean;
  interiorClean: boolean;
  keysReturned: boolean;
  logbookSigned: boolean;
  fuelReplacedOrReported: boolean;
  incidentOccurred: boolean;
  incidentNotes?: string;
  remarks?: string;
}

export interface VehicleTrip {
  id: string;
  tripPassNumber: string; // e.g. "TRIP-2026-0312"
  vehicleId: string;
  fleetNumber: string;
  plateNumber: string;
  makeModel: string;
  
  driverName: string;
  driverEmployeeId: string;
  driverLicenseNumber: string;
  driverPhone: string;
  
  destination: string;
  purpose: string;
  passengersList: string;
  department: string;
  
  departureTime: string; // ISO
  expectedReturnTime: string; // ISO
  actualReturnTime?: string; // ISO
  
  departureOdometer: number;
  returnOdometer?: number;
  distanceTraveledKm?: number;
  
  departureFuelPercent: number;
  returnFuelPercent?: number;
  
  departureGate: string;
  returnGate?: string;
  
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  
  departureChecklist: PreTripChecklist;
  returnChecklist?: PostTripChecklist;
  
  officerDepartureId: string;
  officerDepartureName: string;
  officerReturnId?: string;
  officerReturnName?: string;
  tripNotes?: string;
}
