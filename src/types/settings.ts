export interface GateCheckpoint {
  id: string;
  name: string;
  type: 'PEDESTRIAN' | 'VEHICULAR' | 'COMBINED';
  active: boolean;
  notes?: string;
}

export interface OrgSettings {
  organizationName: string;
  organizationShortName: string;
  facilityName: string;
  facilityAddress: string;
  securityOfficePhone: string;
  emergencyHotline: string;
  gates: GateCheckpoint[];
  currentGateId: string;
  
  visitorBadgePrefix: string;
  defaultVisitorDurationHours: number;
  overstayAlertMinutes: number;
  maxPremiseCapacity: number;
  
  requirePhotoCapture: boolean;
  requireGovernmentId: boolean;
  requireSafetyBriefing: boolean;
  requireVehicleInspection: boolean;
  
  companyDepartments: string[];
}
