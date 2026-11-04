export type IdType = 
  | 'National ID'
  | 'Passport'
  | 'Driver License'
  | 'Military ID'
  | 'Corporate Badge';

export type VisitPurpose = 
  | 'Business Meeting'
  | 'Delivery & Logistics'
  | 'Technical Contractor'
  | 'Job Interview'
  | 'Facility Maintenance'
  | 'VIP Delegation'
  | 'Audit & Inspection'
  | 'Personal Visit';

export type VisitorStatus = 
  | 'ON_SITE'
  | 'CHECKED_OUT'
  | 'OVERDUE'
  | 'PRE_REGISTERED';

export interface CarriedAsset {
  id: string;
  item: string;
  serialNumber?: string;
  verifiedOnExit?: boolean;
}

export interface VisitorProfile {
  id: string;
  fullName: string;
  idType: IdType;
  idNumber: string;
  phoneNumber: string;
  email: string;
  company: string;
  photoUrl?: string;
  isWatchlisted: boolean;
  watchlistReason?: string;
  vip: boolean;
  totalVisits: number;
  firstRegisteredAt: string;
  lastVisitDate: string;
  defaultVehiclePlate?: string;
  notes?: string;
}

export interface VisitorPass {
  id: string;
  visitorProfileId: string;
  badgeNumber: string;
  visitorName: string;
  visitorCompany: string;
  visitorPhone: string;
  visitorEmail?: string;
  idType: IdType;
  idNumber: string;
  photoUrl?: string;
  hostName: string;
  hostDepartment: string;
  purpose: VisitPurpose;
  entryTime: string; // ISO string
  expectedDurationHours: number;
  expectedDepartureTime: string; // ISO string
  actualDepartureTime?: string; // ISO string
  status: VisitorStatus;
  entryGate: string;
  exitGate?: string;
  escortRequired: boolean;
  safetyInductionCompleted: boolean;
  ndaAccepted: boolean;
  assetsCarried: CarriedAsset[];
  vehiclePlate?: string;
  parkingBay?: string;
  officerCheckInId: string;
  officerCheckInName: string;
  officerCheckOutId?: string;
  officerCheckOutName?: string;
  checkOutNotes?: string;
  qrCodeDataUrl?: string;
}
