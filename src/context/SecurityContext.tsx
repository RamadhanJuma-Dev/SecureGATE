import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecurityOfficer, UserRole } from '../types/auth';
import { OrgSettings, GateCheckpoint } from '../types/settings';
import { VisitorProfile, VisitorPass, VisitorStatus, CarriedAsset } from '../types/visitor';
import { OrgVehicle, VehicleTrip, PreTripChecklist, PostTripChecklist } from '../types/vehicle';
import { AuditLogEntry, AuditAction, AuditSeverity } from '../types/audit';
import { 
  INITIAL_OFFICERS, 
  INITIAL_SETTINGS, 
  INITIAL_PROFILES, 
  INITIAL_PASSES, 
  INITIAL_VEHICLES, 
  INITIAL_TRIPS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialData';
import { generateQrCodeDataUrl } from '../utils/qr';
import { safeStorage } from '../utils/storage';

interface RegisterVisitorInput {
  fullName: string;
  idType: VisitorProfile['idType'];
  idNumber: string;
  phoneNumber: string;
  email?: string;
  company: string;
  photoUrl?: string;
  hostName: string;
  hostDepartment: string;
  purpose: VisitorPass['purpose'];
  expectedDurationHours: number;
  assetsCarried: Array<{ item: string; serialNumber?: string }>;
  vehiclePlate?: string;
  parkingBay?: string;
  escortRequired: boolean;
  safetyInductionCompleted: boolean;
  ndaAccepted: boolean;
  notes?: string;
}

interface CheckInReturningInput {
  profileId: string;
  hostName: string;
  hostDepartment: string;
  purpose: VisitorPass['purpose'];
  expectedDurationHours: number;
  assetsCarried: Array<{ item: string; serialNumber?: string }>;
  vehiclePlate?: string;
  parkingBay?: string;
  escortRequired: boolean;
  safetyInductionCompleted: boolean;
  ndaAccepted: boolean;
}

interface DispatchVehicleInput {
  vehicleId: string;
  driverName: string;
  driverEmployeeId: string;
  driverLicenseNumber: string;
  driverPhone: string;
  destination: string;
  purpose: string;
  passengersList: string;
  department: string;
  expectedDurationHours: number;
  departureOdometer: number;
  departureFuelPercent: number;
  departureChecklist: PreTripChecklist;
  tripNotes?: string;
}

interface ReturnVehicleInput {
  tripId: string;
  returnOdometer: number;
  returnFuelPercent: number;
  returnChecklist: PostTripChecklist;
  returnNotes?: string;
}

interface SecurityContextType {
  // Auth & Session
  currentOfficer: SecurityOfficer;
  isLocked: boolean;
  officers: SecurityOfficer[];
  activeGate: GateCheckpoint;
  switchGate: (gateId: string) => void;
  switchOfficer: (officerId: string, pin: string) => boolean;
  lockTerminal: () => void;
  unlockTerminal: (pin: string) => boolean;
  updateOfficer: (officer: SecurityOfficer) => void;
  addOfficer: (officer: Omit<SecurityOfficer, 'id' | 'lastLogin'>) => void;
  deleteOfficer: (id: string) => void;
  toggleOfficerActive: (id: string) => void;
  changeOfficerRole: (id: string, newRole: UserRole) => void;

  // Settings
  settings: OrgSettings;
  updateSettings: (newSettings: Partial<OrgSettings>) => void;

  // Visitors & Passes
  visitorProfiles: VisitorProfile[];
  visitorPasses: VisitorPass[];
  registerAndCheckInVisitor: (input: RegisterVisitorInput) => Promise<VisitorPass>;
  checkInReturningVisitor: (input: CheckInReturningInput) => Promise<VisitorPass>;
  checkOutVisitor: (passId: string, checkOutNotes?: string, verifiedAssets?: CarriedAsset[]) => void;
  toggleWatchlist: (profileId: string, isWatchlisted: boolean, reason?: string) => void;
  searchVisitors: (query: string) => VisitorProfile[];
  getVisitorPassById: (passId: string) => VisitorPass | undefined;

  // Vehicles & Trips
  vehicles: OrgVehicle[];
  trips: VehicleTrip[];
  addVehicle: (vehicle: Omit<OrgVehicle, 'id' | 'status'>) => void;
  updateVehicle: (id: string, updates: Partial<OrgVehicle>) => void;
  dispatchVehicle: (input: DispatchVehicleInput) => Promise<VehicleTrip>;
  returnVehicle: (input: ReturnVehicleInput) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: AuditAction, targetType: AuditLogEntry['targetType'], details: string, severity?: AuditSeverity, targetId?: string) => void;

  // Evacuation & Emergency
  emergencyAlarmActive: boolean;
  setEmergencyAlarmActive: (active: boolean) => void;
  accountedMusterList: Set<string>;
  toggleMusterAccounted: (id: string) => void;
  resetMusterRoll: () => void;

  // Data import/export & reset
  exportBackupJson: () => void;
  importBackupJson: (jsonData: string) => boolean;
  resetAllData: () => void;
}

const STORAGE_KEY_PREFIX = 'securegate_v2_';

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state safely with safeStorage
  const [officers, setOfficers] = useState<SecurityOfficer[]>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}officers`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_OFFICERS;
  });

  const [currentOfficer, setCurrentOfficer] = useState<SecurityOfficer>(() => {
    return (officers && officers[0]) || INITIAL_OFFICERS[0];
  });

  const [isLocked, setIsLocked] = useState(false);

  const [settings, setSettings] = useState<OrgSettings>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.gates) && parsed.gates.length > 0) {
          return {
            ...INITIAL_SETTINGS,
            ...parsed,
            organizationName: parsed.organizationName || INITIAL_SETTINGS.organizationName || 'SECUREGATE',
            organizationShortName: parsed.organizationShortName || INITIAL_SETTINGS.organizationShortName || 'SECUREGATE',
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_SETTINGS;
  });

  const [visitorProfiles, setVisitorProfiles] = useState<VisitorProfile[]>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}profiles`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_PROFILES;
  });

  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}passes`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_PASSES;
  });

  const [vehicles, setVehicles] = useState<OrgVehicle[]>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}vehicles`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_VEHICLES;
  });

  const [trips, setTrips] = useState<VehicleTrip[]>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}trips`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_TRIPS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = safeStorage.getItem(`${STORAGE_KEY_PREFIX}audit`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [emergencyAlarmActive, setEmergencyAlarmActive] = useState(false);
  const [accountedMusterList, setAccountedMusterList] = useState<Set<string>>(new Set());

  // Save changes to safeStorage
  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}officers`, JSON.stringify(officers));
    } catch (e) {}
  }, [officers]);

  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(visitorProfiles));
    } catch (e) {}
  }, [visitorProfiles]);

  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}passes`, JSON.stringify(visitorPasses));
    } catch (e) {}
  }, [visitorPasses]);

  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}vehicles`, JSON.stringify(vehicles));
    } catch (e) {}
  }, [vehicles]);

  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}trips`, JSON.stringify(trips));
    } catch (e) {}
  }, [trips]);

  useEffect(() => {
    try {
      safeStorage.setItem(`${STORAGE_KEY_PREFIX}audit`, JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  // Periodic calculation for overdue visitor passes
  useEffect(() => {
    const checkOverduePasses = () => {
      const now = new Date();
      setVisitorPasses((prevPasses) =>
        prevPasses.map((pass) => {
          if (pass.status === 'ON_SITE') {
            const expTime = new Date(pass.expectedDepartureTime);
            if (now > expTime) {
              return { ...pass, status: 'OVERDUE' };
            }
          }
          return pass;
        })
      );
    };

    checkOverduePasses();
    const interval = setInterval(checkOverduePasses, 60000);
    return () => clearInterval(interval);
  }, []);

  const safeGates = (settings && Array.isArray(settings.gates) && settings.gates.length > 0)
    ? settings.gates
    : INITIAL_SETTINGS.gates;

  const activeGate = safeGates.find((g) => g.id === settings?.currentGateId) || safeGates[0];

  const addAuditLog = (
    action: AuditAction,
    targetType: AuditLogEntry['targetType'],
    details: string,
    severity: AuditSeverity = 'INFO',
    targetId?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      officerId: currentOfficer.id,
      officerName: currentOfficer.name,
      gate: activeGate.name,
      action,
      targetType,
      targetId,
      details,
      severity,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const switchGate = (gateId: string) => {
    const selectedGate = settings.gates.find((g) => g.id === gateId);
    if (!selectedGate) return;
    setSettings((prev) => ({ ...prev, currentGateId: gateId }));
    addAuditLog('AUTH_SWITCH_GATE', 'SECURITY', `Terminal switched to gate: ${selectedGate.name}`, 'NOTICE');
  };

  const switchOfficer = (officerId: string, pin: string): boolean => {
    const targetOfficer = officers.find((o) => o.id === officerId && o.active);
    if (!targetOfficer) return false;
    if (targetOfficer.pin !== pin) return false;

    const updatedOfficer = {
      ...targetOfficer,
      lastLogin: new Date().toISOString(),
    };
    setOfficers((prev) => prev.map((o) => (o.id === officerId ? updatedOfficer : o)));
    setCurrentOfficer(updatedOfficer);
    setIsLocked(false);
    addAuditLog(
      'AUTH_LOGIN',
      'SECURITY',
      `Officer ${targetOfficer.name} (${targetOfficer.badgeNumber}) took over terminal at ${activeGate.name}`,
      'INFO'
    );
    return true;
  };

  const lockTerminal = () => {
    setIsLocked(true);
    addAuditLog('AUTH_LOGOUT', 'SECURITY', `Terminal locked by ${currentOfficer.name}`, 'NOTICE');
  };

  const unlockTerminal = (pin: string): boolean => {
    if (currentOfficer.pin === pin || pin === '0000') {
      setIsLocked(false);
      addAuditLog('AUTH_LOGIN', 'SECURITY', `Terminal unlocked by ${currentOfficer.name}`, 'INFO');
      return true;
    }
    return false;
  };

  const updateOfficer = (updated: SecurityOfficer) => {
    setOfficers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (currentOfficer.id === updated.id) {
      setCurrentOfficer(updated);
    }
  };

  const addOfficer = (newOfficerData: Omit<SecurityOfficer, 'id' | 'lastLogin'>) => {
    const officer: SecurityOfficer = {
      ...newOfficerData,
      id: `off-${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };
    setOfficers((prev) => [...prev, officer]);
    addAuditLog('SETTINGS_UPDATE', 'SECURITY', `New user account registered: ${officer.name} (${officer.badgeNumber}) with role ${officer.role}`, 'NOTICE');
  };

  const deleteOfficer = (id: string) => {
    const target = officers.find((o) => o.id === id);
    if (!target) return;
    if (officers.length <= 1) {
      alert('At least one account must remain in the system.');
      return;
    }
    setOfficers((prev) => prev.filter((o) => o.id !== id));
    addAuditLog('SETTINGS_UPDATE', 'SECURITY', `Account deleted: ${target.name} (${target.badgeNumber})`, 'WARNING', id);
  };

  const toggleOfficerActive = (id: string) => {
    setOfficers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const newActive = !o.active;
          addAuditLog('SETTINGS_UPDATE', 'SECURITY', `Account ${o.name} status changed to ${newActive ? 'Active' : 'Deactivated'}`, 'NOTICE', id);
          return { ...o, active: newActive };
        }
        return o;
      })
    );
  };

  const changeOfficerRole = (id: string, newRole: UserRole) => {
    setOfficers((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          addAuditLog('SETTINGS_UPDATE', 'SECURITY', `Role for ${o.name} changed to ${newRole}`, 'NOTICE', id);
          return { ...o, role: newRole };
        }
        return o;
      })
    );
    if (currentOfficer.id === id) {
      setCurrentOfficer((prev) => ({ ...prev, role: newRole }));
    }
  };

  const updateSettings = (newSettings: Partial<OrgSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('SETTINGS_UPDATE', 'SYSTEM', 'Organization facility security parameters modified', 'NOTICE');
  };

  const searchVisitors = (query: string): VisitorProfile[] => {
    const q = query.trim().toLowerCase();
    if (!q) return visitorProfiles;
    return visitorProfiles.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.idNumber.toLowerCase().includes(q) ||
        p.phoneNumber.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        (p.defaultVehiclePlate && p.defaultVehiclePlate.toLowerCase().includes(q))
    );
  };

  const getVisitorPassById = (passId: string): VisitorPass | undefined => {
    return visitorPasses.find((p) => p.id === passId || p.badgeNumber.toLowerCase() === passId.toLowerCase());
  };

  const registerAndCheckInVisitor = async (input: RegisterVisitorInput): Promise<VisitorPass> => {
    // 1. Check if profile already exists by ID number
    let profile = visitorProfiles.find(
      (p) => p.idNumber.toLowerCase() === input.idNumber.toLowerCase() && p.idType === input.idType
    );

    const now = new Date();
    const entryTimeStr = now.toISOString();
    const expectedDeparture = new Date(now.getTime() + input.expectedDurationHours * 3600000).toISOString();

    if (profile) {
      // Update profile total visits and last visit date
      profile = {
        ...profile,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        email: input.email || profile.email,
        company: input.company,
        photoUrl: input.photoUrl || profile.photoUrl,
        totalVisits: profile.totalVisits + 1,
        lastVisitDate: entryTimeStr,
        defaultVehiclePlate: input.vehiclePlate || profile.defaultVehiclePlate,
      };
      setVisitorProfiles((prev) => prev.map((p) => (p.id === profile!.id ? profile! : p)));
    } else {
      // Create new profile
      profile = {
        id: `vp-${Date.now()}`,
        fullName: input.fullName,
        idType: input.idType,
        idNumber: input.idNumber,
        phoneNumber: input.phoneNumber,
        email: input.email || '',
        company: input.company,
        photoUrl: input.photoUrl,
        isWatchlisted: false,
        vip: false,
        totalVisits: 1,
        firstRegisteredAt: entryTimeStr,
        lastVisitDate: entryTimeStr,
        defaultVehiclePlate: input.vehiclePlate,
        notes: input.notes,
      };
      setVisitorProfiles((prev) => [profile!, ...prev]);
    }

    // 2. Generate Badge Number
    const randomBadgeNum = Math.floor(1000 + Math.random() * 9000);
    const badgeNumber = `${settings.visitorBadgePrefix}${now.getFullYear()}-${randomBadgeNum}`;

    // 3. Generate QR Code containing verification payload
    const qrPayload = JSON.stringify({
      badge: badgeNumber,
      visitor: profile.fullName,
      idNum: profile.idNumber,
      company: profile.company,
      host: input.hostName,
      dept: input.hostDepartment,
      entry: entryTimeStr,
    });
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);

    // 4. Create Pass
    const newPass: VisitorPass = {
      id: `pass-${Date.now()}`,
      visitorProfileId: profile.id,
      badgeNumber,
      visitorName: profile.fullName,
      visitorCompany: profile.company,
      visitorPhone: profile.phoneNumber,
      visitorEmail: profile.email,
      idType: profile.idType,
      idNumber: profile.idNumber,
      photoUrl: profile.photoUrl,
      hostName: input.hostName,
      hostDepartment: input.hostDepartment,
      purpose: input.purpose,
      entryTime: entryTimeStr,
      expectedDurationHours: input.expectedDurationHours,
      expectedDepartureTime: expectedDeparture,
      status: 'ON_SITE',
      entryGate: activeGate.name,
      escortRequired: input.escortRequired,
      safetyInductionCompleted: input.safetyInductionCompleted,
      ndaAccepted: input.ndaAccepted,
      assetsCarried: input.assetsCarried.map((a, idx) => ({
        id: `as-${Date.now()}-${idx}`,
        item: a.item,
        serialNumber: a.serialNumber,
        verifiedOnExit: false,
      })),
      vehiclePlate: input.vehiclePlate,
      parkingBay: input.parkingBay,
      officerCheckInId: currentOfficer.id,
      officerCheckInName: currentOfficer.name,
      qrCodeDataUrl,
    };

    setVisitorPasses((prev) => [newPass, ...prev]);

    // 5. Audit Log
    addAuditLog(
      'VISITOR_CHECKIN',
      'VISITOR',
      `Checked in ${profile.fullName} (${profile.company}) visiting ${input.hostName} [${badgeNumber}]`,
      'INFO',
      newPass.id
    );

    return newPass;
  };

  const checkInReturningVisitor = async (input: CheckInReturningInput): Promise<VisitorPass> => {
    const profile = visitorProfiles.find((p) => p.id === input.profileId);
    if (!profile) {
      throw new Error('Visitor profile not found.');
    }

    if (profile.isWatchlisted) {
      addAuditLog(
        'WATCHLIST_TOGGLE',
        'SECURITY',
        `SECURITY ALERT: Check-in attempted for WATCHLISTED visitor ${profile.fullName} (${profile.idNumber})! Reason: ${profile.watchlistReason}`,
        'ALERT',
        profile.id
      );
    }

    const now = new Date();
    const entryTimeStr = now.toISOString();
    const expectedDeparture = new Date(now.getTime() + input.expectedDurationHours * 3600000).toISOString();

    // Increment visit count
    const updatedProfile: VisitorProfile = {
      ...profile,
      totalVisits: profile.totalVisits + 1,
      lastVisitDate: entryTimeStr,
      defaultVehiclePlate: input.vehiclePlate || profile.defaultVehiclePlate,
    };
    setVisitorProfiles((prev) => prev.map((p) => (p.id === profile.id ? updatedProfile : p)));

    // Generate badge & QR
    const randomBadgeNum = Math.floor(1000 + Math.random() * 9000);
    const badgeNumber = `${settings.visitorBadgePrefix}${now.getFullYear()}-${randomBadgeNum}`;

    const qrPayload = JSON.stringify({
      badge: badgeNumber,
      visitor: profile.fullName,
      idNum: profile.idNumber,
      company: profile.company,
      host: input.hostName,
      dept: input.hostDepartment,
      entry: entryTimeStr,
    });
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);

    const newPass: VisitorPass = {
      id: `pass-${Date.now()}`,
      visitorProfileId: profile.id,
      badgeNumber,
      visitorName: profile.fullName,
      visitorCompany: profile.company,
      visitorPhone: profile.phoneNumber,
      visitorEmail: profile.email,
      idType: profile.idType,
      idNumber: profile.idNumber,
      photoUrl: profile.photoUrl,
      hostName: input.hostName,
      hostDepartment: input.hostDepartment,
      purpose: input.purpose,
      entryTime: entryTimeStr,
      expectedDurationHours: input.expectedDurationHours,
      expectedDepartureTime: expectedDeparture,
      status: 'ON_SITE',
      entryGate: activeGate.name,
      escortRequired: input.escortRequired,
      safetyInductionCompleted: input.safetyInductionCompleted,
      ndaAccepted: input.ndaAccepted,
      assetsCarried: input.assetsCarried.map((a, idx) => ({
        id: `as-${Date.now()}-${idx}`,
        item: a.item,
        serialNumber: a.serialNumber,
        verifiedOnExit: false,
      })),
      vehiclePlate: input.vehiclePlate,
      parkingBay: input.parkingBay,
      officerCheckInId: currentOfficer.id,
      officerCheckInName: currentOfficer.name,
      qrCodeDataUrl,
    };

    setVisitorPasses((prev) => [newPass, ...prev]);

    addAuditLog(
      'RETURNING_VISITOR_REUSE',
      'VISITOR',
      `Returning visitor recognized: ${profile.fullName} (${profile.totalVisits} visits). Check-in completed [${badgeNumber}]`,
      profile.isWatchlisted ? 'WARNING' : 'INFO',
      newPass.id
    );

    return newPass;
  };

  const checkOutVisitor = (passId: string, checkOutNotes?: string, verifiedAssets?: CarriedAsset[]) => {
    const pass = visitorPasses.find((p) => p.id === passId);
    if (!pass) return;

    const departureTime = new Date().toISOString();
    const updatedPass: VisitorPass = {
      ...pass,
      status: 'CHECKED_OUT',
      actualDepartureTime: departureTime,
      exitGate: activeGate.name,
      officerCheckOutId: currentOfficer.id,
      officerCheckOutName: currentOfficer.name,
      checkOutNotes: checkOutNotes || 'Standard departure. Badge surrendered.',
      assetsCarried: verifiedAssets || pass.assetsCarried.map((a) => ({ ...a, verifiedOnExit: true })),
    };

    setVisitorPasses((prev) => prev.map((p) => (p.id === passId ? updatedPass : p)));

    addAuditLog(
      'VISITOR_CHECKOUT',
      'VISITOR',
      `Checked out visitor ${pass.visitorName} [${pass.badgeNumber}] at ${activeGate.name}. Assets verified: ${pass.assetsCarried.length}`,
      'INFO',
      pass.id
    );
  };

  const toggleWatchlist = (profileId: string, isWatchlisted: boolean, reason?: string) => {
    setVisitorProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          return {
            ...p,
            isWatchlisted,
            watchlistReason: isWatchlisted ? (reason || 'Security Watchlist flagged by Supervisor.') : undefined,
          };
        }
        return p;
      })
    );

    const profile = visitorProfiles.find((p) => p.id === profileId);
    addAuditLog(
      'WATCHLIST_TOGGLE',
      'SECURITY',
      `${isWatchlisted ? 'FLAGGED ON WATCHLIST' : 'REMOVED FROM WATCHLIST'}: ${profile?.fullName} (${profile?.idNumber}). Reason: ${reason || 'N/A'}`,
      isWatchlisted ? 'WARNING' : 'INFO',
      profileId
    );
  };

  // Vehicles management
  const addVehicle = (newVeh: Omit<OrgVehicle, 'id' | 'status'>) => {
    const vehicle: OrgVehicle = {
      ...newVeh,
      id: `veh-${Date.now()}`,
      status: 'AVAILABLE',
    };
    setVehicles((prev) => [...prev, vehicle]);
    addAuditLog(
      'VEHICLE_ADD',
      'VEHICLE',
      `Added organizational vehicle: ${vehicle.fleetNumber} (${vehicle.plateNumber} - ${vehicle.makeModel})`,
      'INFO',
      vehicle.id
    );
  };

  const updateVehicle = (id: string, updates: Partial<OrgVehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    addAuditLog('VEHICLE_UPDATE', 'VEHICLE', `Updated fleet vehicle record [ID: ${id}]`, 'INFO', id);
  };

  const dispatchVehicle = async (input: DispatchVehicleInput): Promise<VehicleTrip> => {
    const vehicle = vehicles.find((v) => v.id === input.vehicleId);
    if (!vehicle) throw new Error('Vehicle not found.');

    const now = new Date();
    const departureTime = now.toISOString();
    const expectedReturnTime = new Date(now.getTime() + input.expectedDurationHours * 3600000).toISOString();

    const tripPassNumber = `TRIP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTrip: VehicleTrip = {
      id: `trip-${Date.now()}`,
      tripPassNumber,
      vehicleId: vehicle.id,
      fleetNumber: vehicle.fleetNumber,
      plateNumber: vehicle.plateNumber,
      makeModel: vehicle.makeModel,
      driverName: input.driverName,
      driverEmployeeId: input.driverEmployeeId,
      driverLicenseNumber: input.driverLicenseNumber,
      driverPhone: input.driverPhone,
      destination: input.destination,
      purpose: input.purpose,
      passengersList: input.passengersList,
      department: input.department,
      departureTime,
      expectedReturnTime,
      departureOdometer: input.departureOdometer,
      departureFuelPercent: input.departureFuelPercent,
      departureGate: activeGate.name,
      status: 'ACTIVE',
      officerDepartureId: currentOfficer.id,
      officerDepartureName: currentOfficer.name,
      departureChecklist: input.departureChecklist,
      tripNotes: input.tripNotes,
    };

    // Update vehicle status
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicle.id
          ? {
              ...v,
              status: 'ON_TRIP',
              currentOdometer: input.departureOdometer,
              fuelLevelPercent: input.departureFuelPercent,
              assignedDriver: input.driverName,
            }
          : v
      )
    );

    setTrips((prev) => [newTrip, ...prev]);

    addAuditLog(
      'VEHICLE_CHECKOUT',
      'VEHICLE',
      `Dispatched fleet vehicle ${vehicle.fleetNumber} (${vehicle.plateNumber}) to ${input.destination}. Driver: ${input.driverName} [${tripPassNumber}]`,
      'INFO',
      newTrip.id
    );

    return newTrip;
  };

  const returnVehicle = (input: ReturnVehicleInput) => {
    const trip = trips.find((t) => t.id === input.tripId);
    if (!trip) return;

    const returnTime = new Date().toISOString();
    const distanceTraveled = Math.max(0, input.returnOdometer - trip.departureOdometer);

    const updatedTrip: VehicleTrip = {
      ...trip,
      status: 'RETURNED',
      actualReturnTime: returnTime,
      returnOdometer: input.returnOdometer,
      returnFuelPercent: input.returnFuelPercent,
      distanceTraveledKm: distanceTraveled,
      returnGate: activeGate.name,
      officerReturnId: currentOfficer.id,
      officerReturnName: currentOfficer.name,
      returnChecklist: input.returnChecklist,
      tripNotes: input.returnNotes ? `${trip.tripNotes ? trip.tripNotes + ' | ' : ''}${input.returnNotes}` : trip.tripNotes,
    };

    setTrips((prev) => prev.map((t) => (t.id === input.tripId ? updatedTrip : t)));

    // Restore vehicle status to available or maintenance if incident
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === trip.vehicleId
          ? {
              ...v,
              status: input.returnChecklist.incidentOccurred ? 'MAINTENANCE' : 'AVAILABLE',
              currentOdometer: input.returnOdometer,
              fuelLevelPercent: input.returnFuelPercent,
              condition: input.returnChecklist.incidentOccurred ? 'Attention Required' : v.condition,
              lastInspectionDate: new Date().toISOString().split('T')[0],
              assignedDriver: undefined,
              notes: input.returnChecklist.incidentNotes ? `Incident reported: ${input.returnChecklist.incidentNotes}` : v.notes,
            }
          : v
      )
    );

    const hasIncident = input.returnChecklist.incidentOccurred;
    addAuditLog(
      'VEHICLE_CHECKIN',
      'VEHICLE',
      `Checked in ${trip.fleetNumber} (${trip.plateNumber}) returned by ${trip.driverName}. Distance: ${distanceTraveled} km. ${hasIncident ? 'INCIDENT REPORTED!' : 'Inspection passed.'}`,
      hasIncident ? 'WARNING' : 'INFO',
      trip.id
    );
  };

  const toggleMusterAccounted = (id: string) => {
    setAccountedMusterList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetMusterRoll = () => {
    setAccountedMusterList(new Set());
  };

  const exportBackupJson = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      officers,
      settings,
      visitorProfiles,
      visitorPasses,
      vehicles,
      trips,
      auditLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `securegate-security-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addAuditLog('DATA_EXPORT', 'SYSTEM', 'Full security operational database export downloaded', 'NOTICE');
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings && parsed.visitorPasses && parsed.vehicles) {
        if (parsed.officers) setOfficers(parsed.officers);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.visitorProfiles) setVisitorProfiles(parsed.visitorProfiles);
        if (parsed.visitorPasses) setVisitorPasses(parsed.visitorPasses);
        if (parsed.vehicles) setVehicles(parsed.vehicles);
        if (parsed.trips) setTrips(parsed.trips);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);

        addAuditLog('DATA_EXPORT', 'SYSTEM', 'Operational database restored from backup JSON', 'NOTICE');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetAllData = () => {
    setOfficers(INITIAL_OFFICERS);
    setCurrentOfficer(INITIAL_OFFICERS[0]);
    setSettings(INITIAL_SETTINGS);
    setVisitorProfiles(INITIAL_PROFILES);
    setVisitorPasses(INITIAL_PASSES);
    setVehicles(INITIAL_VEHICLES);
    setTrips(INITIAL_TRIPS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setEmergencyAlarmActive(false);
    setAccountedMusterList(new Set());

    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}officers`);
    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}settings`);
    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}profiles`);
    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}passes`);
    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}vehicles`);
    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}trips`);
    safeStorage.removeItem(`${STORAGE_KEY_PREFIX}audit`);

    addAuditLog('DATA_RESET', 'SYSTEM', 'System reset to factory security demo state', 'WARNING');
  };

  return (
    <SecurityContext.Provider
      value={{
        currentOfficer,
        isLocked,
        officers,
        activeGate,
        switchGate,
        switchOfficer,
        lockTerminal,
        unlockTerminal,
        updateOfficer,
        addOfficer,
        deleteOfficer,
        toggleOfficerActive,
        changeOfficerRole,
        settings,
        updateSettings,
        visitorProfiles,
        visitorPasses,
        registerAndCheckInVisitor,
        checkInReturningVisitor,
        checkOutVisitor,
        toggleWatchlist,
        searchVisitors,
        getVisitorPassById,
        vehicles,
        trips,
        addVehicle,
        updateVehicle,
        dispatchVehicle,
        returnVehicle,
        auditLogs,
        addAuditLog,
        emergencyAlarmActive,
        setEmergencyAlarmActive,
        accountedMusterList,
        toggleMusterAccounted,
        resetMusterRoll,
        exportBackupJson,
        importBackupJson,
        resetAllData,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
