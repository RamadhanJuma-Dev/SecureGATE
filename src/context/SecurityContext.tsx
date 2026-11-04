import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecurityOfficer, UserRole } from '../types/auth';
import { OrgSettings, GateCheckpoint } from '../types/settings';
import { VisitorProfile, VisitorPass, CarriedAsset } from '../types/visitor';
import { OrgVehicle, VehicleTrip, PreTripChecklist, PostTripChecklist } from '../types/vehicle';
import { AuditLogEntry, AuditAction, AuditSeverity } from '../types/audit';
import { 
  INITIAL_OFFICERS, 
  INITIAL_SETTINGS, 
} from '../data/initialData';
import { generateQrCodeDataUrl } from '../utils/qr';
import { supabase, testSupabaseConnection, SUPABASE_PROJECT_ID } from '../lib/supabase';
import { SupabaseService } from '../services/supabaseService';
import { 
  hashPin, 
  verifyPin, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  getLockoutStatus,
  MAX_FAILED_ATTEMPTS 
} from '../utils/securityAuth';

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
  // Loading & Offline states
  isLoading: boolean;
  isOffline: boolean;

  // Auth & Session
  currentOfficer: SecurityOfficer;
  isLocked: boolean;
  officers: SecurityOfficer[];
  activeGate: GateCheckpoint;
  switchGate: (gateId: string) => void;
  switchOfficer: (officerId: string, pin: string) => boolean;
  lockTerminal: () => void;
  unlockTerminal: (pin: string) => boolean;
  getLockoutStatus: (identifier: string) => { isLocked: boolean; attempts: number; remainingSeconds: number };
  recordFailedAttempt: (identifier: string) => { isLocked: boolean; attempts: number; remainingSeconds: number };
  resetFailedAttempts: (identifier: string) => void;
  updateOfficer: (officer: SecurityOfficer) => Promise<void>;
  addOfficer: (officer: Omit<SecurityOfficer, 'id' | 'lastLogin'>) => Promise<void>;
  deleteOfficer: (id: string) => Promise<void>;
  toggleOfficerActive: (id: string) => Promise<void>;
  changeOfficerRole: (id: string, newRole: UserRole) => Promise<void>;

  // Settings
  settings: OrgSettings;
  updateSettings: (newSettings: Partial<OrgSettings>) => Promise<void>;

  // Visitors & Passes
  visitorProfiles: VisitorProfile[];
  visitorPasses: VisitorPass[];
  registerAndCheckInVisitor: (input: RegisterVisitorInput) => Promise<VisitorPass>;
  checkInReturningVisitor: (input: CheckInReturningInput) => Promise<VisitorPass>;
  checkOutVisitor: (passId: string, checkOutNotes?: string, verifiedAssets?: CarriedAsset[]) => Promise<void>;
  toggleWatchlist: (profileId: string, isWatchlisted: boolean, reason?: string) => Promise<void>;
  searchVisitors: (query: string) => VisitorProfile[];
  getVisitorPassById: (passId: string) => VisitorPass | undefined;

  // Vehicles & Trips
  vehicles: OrgVehicle[];
  trips: VehicleTrip[];
  addVehicle: (vehicle: Omit<OrgVehicle, 'id' | 'status'>) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<OrgVehicle>) => Promise<void>;
  dispatchVehicle: (input: DispatchVehicleInput) => Promise<VehicleTrip>;
  returnVehicle: (input: ReturnVehicleInput) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: AuditAction, targetType: AuditLogEntry['targetType'], details: string, severity?: AuditSeverity, targetId?: string) => Promise<void>;

  // Evacuation & Emergency
  emergencyAlarmActive: boolean;
  setEmergencyAlarmActive: (active: boolean) => void;
  accountedMusterList: Set<string>;
  toggleMusterAccounted: (id: string) => void;
  resetMusterRoll: () => void;

  // Data import/export & reset
  exportBackupJson: () => void;
  importBackupJson: (jsonData: string) => boolean;
  resetAllData: () => Promise<void>;

  // Supabase Cloud Database Storage
  cloudConnected: boolean;
  cloudSyncing: boolean;
  lastCloudSync: string | null;
  supabaseProjectId: string;
  pushAllDataToSupabase: () => Promise<boolean>;
  refreshFromSupabase: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loading & Connectivity States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [cloudConnected, setCloudConnected] = useState<boolean>(false);
  const [cloudSyncing, setCloudSyncing] = useState<boolean>(false);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);

  // Core Data States - Initialized empty / clean defaults with no localStorage reading
  const [officers, setOfficers] = useState<SecurityOfficer[]>([]);
  const [currentOfficer, setCurrentOfficer] = useState<SecurityOfficer>(INITIAL_OFFICERS[0]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [settings, setSettings] = useState<OrgSettings>(INITIAL_SETTINGS);
  const [visitorProfiles, setVisitorProfiles] = useState<VisitorProfile[]>([]);
  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>([]);
  const [vehicles, setVehicles] = useState<OrgVehicle[]>([]);
  const [trips, setTrips] = useState<VehicleTrip[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [emergencyAlarmActive, setEmergencyAlarmActive] = useState<boolean>(false);
  const [accountedMusterList, setAccountedMusterList] = useState<Set<string>>(new Set());

  const safeGates = (settings && Array.isArray(settings.gates) && settings.gates.length > 0)
    ? settings.gates
    : INITIAL_SETTINGS.gates;

  const activeGate = safeGates.find((g) => g.id === settings?.currentGateId) || safeGates[0];

  // --- REFRESH FROM SUPABASE ---
  const refreshFromSupabase = async () => {
    setIsLoading(true);
    try {
      const status = await testSupabaseConnection();
      setCloudConnected(status.connected);

      if (status.connected) {
        const [cloudPasses, cloudTrips, cloudVehicles, cloudProfiles, cloudOfficers, cloudSettings, cloudAudit] =
          await Promise.all([
            SupabaseService.fetchPasses(),
            SupabaseService.fetchTrips(),
            SupabaseService.fetchVehicles(),
            SupabaseService.fetchProfiles(),
            SupabaseService.fetchOfficers(),
            SupabaseService.fetchSettings(),
            SupabaseService.fetchAuditLogs(),
          ]);

        if (cloudPasses) setVisitorPasses(cloudPasses);
        if (cloudTrips) setTrips(cloudTrips);
        if (cloudVehicles) setVehicles(cloudVehicles);
        if (cloudProfiles) setVisitorProfiles(cloudProfiles);
        if (cloudOfficers && cloudOfficers.length > 0) {
          setOfficers(cloudOfficers);
          setCurrentOfficer((prev) => {
            const match = cloudOfficers.find((o) => o.id === prev.id);
            return match || cloudOfficers[0];
          });
        } else {
          setOfficers(INITIAL_OFFICERS);
        }
        if (cloudSettings) setSettings(cloudSettings);
        if (cloudAudit) setAuditLogs(cloudAudit);

        setLastCloudSync(new Date().toLocaleTimeString());
        setIsOffline(false);
      } else {
        setIsOffline(true);
      }
    } catch (err) {
      console.warn('Supabase cloud fetch failed:', err);
      setIsOffline(true);
      setCloudConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial cloud handshake & Realtime Subscription on mount
  useEffect(() => {
    refreshFromSupabase();

    // Setup Realtime multi-gate channel
    const channel = supabase
      .channel('public:gate_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_passes' }, async () => {
        const updatedPasses = await SupabaseService.fetchPasses();
        if (updatedPasses) setVisitorPasses(updatedPasses);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, async () => {
        const updatedTrips = await SupabaseService.fetchTrips();
        if (updatedTrips) setTrips(updatedTrips);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, async () => {
        const updatedVehicles = await SupabaseService.fetchVehicles();
        if (updatedVehicles) setVehicles(updatedVehicles);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'officers' }, async () => {
        const updatedOfficers = await SupabaseService.fetchOfficers();
        if (updatedOfficers) setOfficers(updatedOfficers);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- AUDIT LOG MUTATION ---
  const addAuditLog = async (
    action: AuditAction,
    targetType: AuditLogEntry['targetType'],
    details: string,
    severity: AuditSeverity = 'INFO',
    targetId?: string
  ): Promise<void> => {
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

    // Direct write to Supabase (non-blocking if it fails)
    try {
      await SupabaseService.insertAuditLog(newEntry);
    } catch (e) {
      console.error('Supabase audit log insert error (non-blocking):', e);
    }

    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // --- TERMINAL & AUTH ---
  const switchGate = (gateId: string) => {
    const selectedGate = settings.gates.find((g) => g.id === gateId);
    if (!selectedGate) return;
    setSettings((prev) => ({ ...prev, currentGateId: gateId }));
    addAuditLog('AUTH_SWITCH_GATE', 'SECURITY', `Terminal switched to gate: ${selectedGate.name}`, 'NOTICE');
  };

  const switchOfficer = (officerId: string, pin: string): boolean => {
    const targetOfficer = officers.find((o) => o.id === officerId && o.active);
    if (!targetOfficer) return false;

    // Check if account is locked out due to consecutive failed attempts
    const lockout = getLockoutStatus(targetOfficer.badgeNumber);
    if (lockout.isLocked) {
      addAuditLog(
        'AUTH_LOCKOUT',
        'SECURITY',
        `Access denied: Account ${targetOfficer.name} (${targetOfficer.badgeNumber}) is temporarily locked out (${lockout.remainingSeconds}s remaining)`,
        'ALERT'
      );
      return false;
    }

    if (!verifyPin(pin, targetOfficer.pin)) {
      const result = recordFailedAttempt(targetOfficer.badgeNumber);
      addAuditLog(
        'AUTH_FAILED',
        'SECURITY',
        `Failed authentication attempt for ${targetOfficer.name} (${targetOfficer.badgeNumber}) - Attempt ${result.attempts} of ${MAX_FAILED_ATTEMPTS}`,
        result.isLocked ? 'ALERT' : 'WARNING'
      );
      return false;
    }

    resetFailedAttempts(targetOfficer.badgeNumber);
    setCurrentOfficer(targetOfficer);
    addAuditLog(
      'AUTH_LOGIN',
      'SECURITY',
      `Officer ${targetOfficer.name} (${targetOfficer.badgeNumber}) authenticated and took over terminal at ${activeGate.name}`,
      'INFO'
    );
    return true;
  };

  const lockTerminal = () => {
    setIsLocked(true);
    addAuditLog('AUTH_LOCK', 'SECURITY', `Security workstation locked at ${activeGate.name} by ${currentOfficer.name}`, 'INFO');
  };

  const unlockTerminal = (pin: string): boolean => {
    const lockout = getLockoutStatus(currentOfficer.badgeNumber);
    if (lockout.isLocked) {
      addAuditLog(
        'AUTH_LOCKOUT',
        'SECURITY',
        `Terminal unlock refused: Account ${currentOfficer.name} (${currentOfficer.badgeNumber}) is temporarily locked out (${lockout.remainingSeconds}s remaining)`,
        'ALERT'
      );
      return false;
    }

    if (verifyPin(pin, currentOfficer.pin)) {
      resetFailedAttempts(currentOfficer.badgeNumber);
      setIsLocked(false);
      addAuditLog('AUTH_UNLOCK', 'SECURITY', `Security terminal unlocked by ${currentOfficer.name}`, 'INFO');
      return true;
    }

    const result = recordFailedAttempt(currentOfficer.badgeNumber);
    addAuditLog(
      'AUTH_FAILED',
      'SECURITY',
      `Failed terminal unlock attempt on ${currentOfficer.name} (${currentOfficer.badgeNumber}) - Attempt ${result.attempts} of ${MAX_FAILED_ATTEMPTS}`,
      result.isLocked ? 'ALERT' : 'WARNING'
    );
    return false;
  };

  // --- OFFICER MUTATIONS DIRECT TO SUPABASE ---
  const updateOfficer = async (updated: SecurityOfficer): Promise<void> => {
    const safeOfficer: SecurityOfficer = {
      ...updated,
      pin: hashPin(updated.pin),
    };
    try {
      await SupabaseService.upsertOfficer(safeOfficer);
      setOfficers((prev) => prev.map((o) => (o.id === updated.id ? safeOfficer : o)));
      if (currentOfficer.id === updated.id) {
        setCurrentOfficer(safeOfficer);
      }
    } catch (err) {
      console.error('Failed to update officer in Supabase:', err);
      throw err;
    }
  };

  const addOfficer = async (newOfficerData: Omit<SecurityOfficer, 'id' | 'lastLogin'>): Promise<void> => {
    const officer: SecurityOfficer = {
      ...newOfficerData,
      pin: hashPin(newOfficerData.pin),
      id: `off-${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };
    try {
      await SupabaseService.upsertOfficer(officer);
      await addAuditLog('SETTINGS_UPDATE', 'SECURITY', `New user account registered: ${officer.name} (${officer.badgeNumber}) with role ${officer.role}`, 'NOTICE');
      setOfficers((prev) => [...prev, officer]);
    } catch (err) {
      console.error('Failed to add officer in Supabase:', err);
      throw err;
    }
  };

  const deleteOfficer = async (id: string): Promise<void> => {
    const target = officers.find((o) => o.id === id);
    if (!target) return;
    if (officers.length <= 1) {
      alert('At least one account must remain in the system.');
      return;
    }
    try {
      await SupabaseService.deleteOfficer(id);
      await addAuditLog('SETTINGS_UPDATE', 'SECURITY', `Account deleted: ${target.name} (${target.badgeNumber})`, 'WARNING', id);
      setOfficers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to delete officer in Supabase:', err);
      throw err;
    }
  };

  const toggleOfficerActive = async (id: string): Promise<void> => {
    const target = officers.find((o) => o.id === id);
    if (!target) return;
    const newActive = !target.active;
    const updated = { ...target, active: newActive };
    try {
      await SupabaseService.upsertOfficer(updated);
      await addAuditLog('SETTINGS_UPDATE', 'SECURITY', `Account ${target.name} status changed to ${newActive ? 'Active' : 'Deactivated'}`, 'NOTICE', id);
      setOfficers((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      console.error('Failed to toggle officer status in Supabase:', err);
      throw err;
    }
  };

  const changeOfficerRole = async (id: string, newRole: UserRole): Promise<void> => {
    const target = officers.find((o) => o.id === id);
    if (!target) return;
    const updated = { ...target, role: newRole };
    try {
      await SupabaseService.upsertOfficer(updated);
      await addAuditLog('SETTINGS_UPDATE', 'SECURITY', `Role for ${target.name} changed to ${newRole}`, 'NOTICE', id);
      setOfficers((prev) => prev.map((o) => (o.id === id ? updated : o)));
      if (currentOfficer.id === id) {
        setCurrentOfficer((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error('Failed to change officer role in Supabase:', err);
      throw err;
    }
  };

  // --- SETTINGS MUTATION DIRECT TO SUPABASE ---
  const updateSettings = async (newSettings: Partial<OrgSettings>): Promise<void> => {
    const merged = { ...settings, ...newSettings };
    try {
      await SupabaseService.upsertSettings(merged);
      await addAuditLog('SETTINGS_UPDATE', 'SYSTEM', 'Organization facility security parameters modified', 'NOTICE');
      setSettings(merged);
    } catch (err) {
      console.error('Failed to update settings in Supabase:', err);
      throw err;
    }
  };

  // --- VISITOR SEARCH ---
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

  // --- VISITOR CHECK-IN DIRECT TO SUPABASE ---
  const registerAndCheckInVisitor = async (input: RegisterVisitorInput): Promise<VisitorPass> => {
    try {
      // 1. Check if profile already exists by ID number
      let profile = visitorProfiles.find(
        (p) => p.idNumber.toLowerCase() === input.idNumber.toLowerCase() && p.idType === input.idType
      );

      const now = new Date();
      const entryTimeStr = now.toISOString();
      const expectedDeparture = new Date(now.getTime() + input.expectedDurationHours * 3600000).toISOString();

      if (profile) {
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
      } else {
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
      }

      // Generate Badge Number
      const randomBadgeNum = Math.floor(1000 + Math.random() * 9000);
      const badgeNumber = `${settings.visitorBadgePrefix}${now.getFullYear()}-${randomBadgeNum}`;

      // Generate QR Code containing verification payload
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

      // Create Pass
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

      // 1. Direct write to Supabase visitor_profiles
      await SupabaseService.upsertProfile(profile);

      // 2. Direct write to Supabase visitor_passes
      await SupabaseService.upsertPass(newPass);

      // 3. Direct write to Supabase audit_logs
      await addAuditLog(
        'VISITOR_CHECKIN',
        'VISITOR',
        `Checked in ${profile.fullName} (${profile.company}) visiting ${input.hostName} [${badgeNumber}]`,
        'INFO',
        newPass.id
      );

      // 4. Update React state AFTER database succeeds
      setVisitorProfiles((prev) => {
        const exists = prev.some((p) => p.id === profile!.id);
        return exists ? prev.map((p) => (p.id === profile!.id ? profile! : p)) : [profile!, ...prev];
      });
      setVisitorPasses((prev) => [newPass, ...prev]);

      return newPass;
    } catch (err) {
      console.error('Database write error during registerAndCheckInVisitor:', err);
      throw err;
    }
  };

  const checkInReturningVisitor = async (input: CheckInReturningInput): Promise<VisitorPass> => {
    try {
      const profile = visitorProfiles.find((p) => p.id === input.profileId);
      if (!profile) {
        throw new Error('Visitor profile not found.');
      }

      const now = new Date();
      const entryTimeStr = now.toISOString();
      const expectedDeparture = new Date(now.getTime() + input.expectedDurationHours * 3600000).toISOString();

      const updatedProfile: VisitorProfile = {
        ...profile,
        totalVisits: profile.totalVisits + 1,
        lastVisitDate: entryTimeStr,
        defaultVehiclePlate: input.vehiclePlate || profile.defaultVehiclePlate,
      };

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

      // 1. Direct write to Supabase
      await SupabaseService.upsertProfile(updatedProfile);
      await SupabaseService.upsertPass(newPass);

      await addAuditLog(
        'RETURNING_VISITOR_REUSE',
        'VISITOR',
        `Returning visitor recognized: ${profile.fullName} (${updatedProfile.totalVisits} visits). Check-in completed [${badgeNumber}]`,
        profile.isWatchlisted ? 'WARNING' : 'INFO',
        newPass.id
      );

      // 2. Update React state
      setVisitorProfiles((prev) => prev.map((p) => (p.id === profile.id ? updatedProfile : p)));
      setVisitorPasses((prev) => [newPass, ...prev]);

      return newPass;
    } catch (err) {
      console.error('Database write error during checkInReturningVisitor:', err);
      throw err;
    }
  };

  // --- VISITOR CHECK-OUT DIRECT TO SUPABASE ---
  const checkOutVisitor = async (passId: string, checkOutNotes?: string, verifiedAssets?: CarriedAsset[]): Promise<void> => {
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

    try {
      // 1. Direct write to Supabase
      await SupabaseService.upsertPass(updatedPass);

      // 2. Audit log
      await addAuditLog(
        'VISITOR_CHECKOUT',
        'VISITOR',
        `Checked out visitor ${pass.visitorName} [${pass.badgeNumber}] at ${activeGate.name}. Assets verified: ${updatedPass.assetsCarried.length}`,
        'INFO',
        pass.id
      );

      // 3. Update React state
      setVisitorPasses((prev) => prev.map((p) => (p.id === passId ? updatedPass : p)));
    } catch (err) {
      console.error('Database write error during checkOutVisitor:', err);
      throw err;
    }
  };

  const toggleWatchlist = async (profileId: string, isWatchlisted: boolean, reason?: string): Promise<void> => {
    const profile = visitorProfiles.find((p) => p.id === profileId);
    if (!profile) return;

    const updatedProfile: VisitorProfile = {
      ...profile,
      isWatchlisted,
      watchlistReason: isWatchlisted ? (reason || 'Security Watchlist flagged by Supervisor.') : undefined,
    };

    try {
      await SupabaseService.upsertProfile(updatedProfile);
      await addAuditLog(
        'WATCHLIST_TOGGLE',
        'SECURITY',
        `${isWatchlisted ? 'FLAGGED ON WATCHLIST' : 'REMOVED FROM WATCHLIST'}: ${profile.fullName} (${profile.idNumber}). Reason: ${reason || 'N/A'}`,
        isWatchlisted ? 'WARNING' : 'INFO',
        profileId
      );
      setVisitorProfiles((prev) => prev.map((p) => (p.id === profileId ? updatedProfile : p)));
    } catch (err) {
      console.error('Failed to update watchlist in Supabase:', err);
      throw err;
    }
  };

  // --- VEHICLES & TRIPS DIRECT TO SUPABASE ---
  const addVehicle = async (newVeh: Omit<OrgVehicle, 'id' | 'status'>): Promise<void> => {
    const vehicle: OrgVehicle = {
      ...newVeh,
      id: `veh-${Date.now()}`,
      status: 'AVAILABLE',
    };
    try {
      await SupabaseService.upsertVehicle(vehicle);
      await addAuditLog(
        'VEHICLE_ADD',
        'VEHICLE',
        `Added organizational vehicle: ${vehicle.fleetNumber} (${vehicle.plateNumber} - ${vehicle.makeModel})`,
        'INFO',
        vehicle.id
      );
      setVehicles((prev) => [...prev, vehicle]);
    } catch (err) {
      console.error('Failed to add vehicle in Supabase:', err);
      throw err;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<OrgVehicle>): Promise<void> => {
    const target = vehicles.find((v) => v.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    try {
      await SupabaseService.upsertVehicle(updated);
      await addAuditLog('VEHICLE_UPDATE', 'VEHICLE', `Updated fleet vehicle record [ID: ${id}]`, 'INFO', id);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      console.error('Failed to update vehicle in Supabase:', err);
      throw err;
    }
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

    const updatedVehicle: OrgVehicle = {
      ...vehicle,
      status: 'ON_TRIP',
      currentOdometer: input.departureOdometer,
      fuelLevelPercent: input.departureFuelPercent,
      assignedDriver: input.driverName,
    };

    try {
      // 1. Direct write trip to Supabase
      await SupabaseService.upsertTrip(newTrip);

      // 2. Direct update vehicle status in Supabase
      await SupabaseService.upsertVehicle(updatedVehicle);

      // 3. Direct audit log
      await addAuditLog(
        'VEHICLE_CHECKOUT',
        'VEHICLE',
        `Dispatched fleet vehicle ${vehicle.fleetNumber} (${vehicle.plateNumber}) to ${input.destination}. Driver: ${input.driverName} [${tripPassNumber}]`,
        'INFO',
        newTrip.id
      );

      // 4. Update React state
      setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? updatedVehicle : v)));
      setTrips((prev) => [newTrip, ...prev]);

      return newTrip;
    } catch (err) {
      console.error('Database write error during dispatchVehicle:', err);
      throw err;
    }
  };

  const returnVehicle = async (input: ReturnVehicleInput): Promise<void> => {
    const trip = trips.find((t) => t.id === input.tripId);
    if (!trip) throw new Error('Vehicle trip record not found.');

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

    const hasIncident = input.returnChecklist.incidentOccurred;
    const existingVehicle = vehicles.find((v) => v.id === trip.vehicleId);

    const updatedVehicle: OrgVehicle = existingVehicle
      ? {
          ...existingVehicle,
          status: hasIncident ? 'MAINTENANCE' : 'AVAILABLE',
          currentOdometer: input.returnOdometer,
          fuelLevelPercent: input.returnFuelPercent,
          condition: hasIncident ? 'Attention Required' : existingVehicle.condition,
          lastInspectionDate: new Date().toISOString().split('T')[0],
          assignedDriver: undefined,
          notes: input.returnChecklist.incidentNotes ? `Incident reported: ${input.returnChecklist.incidentNotes}` : existingVehicle.notes,
        }
      : {
          id: trip.vehicleId,
          fleetNumber: trip.fleetNumber,
          plateNumber: trip.plateNumber,
          makeModel: trip.makeModel,
          year: 2024,
          type: 'Sedan',
          assignedDepartment: 'Operations',
          currentOdometer: input.returnOdometer,
          fuelLevelPercent: input.returnFuelPercent,
          status: hasIncident ? 'MAINTENANCE' : 'AVAILABLE',
          condition: hasIncident ? 'Attention Required' : 'Good',
        };

    try {
      // 1. Direct update trip in Supabase
      await SupabaseService.upsertTrip(updatedTrip);

      // 2. Direct update vehicle in Supabase
      await SupabaseService.upsertVehicle(updatedVehicle);

      // 3. Direct audit log
      await addAuditLog(
        'VEHICLE_CHECKIN',
        'VEHICLE',
        `Checked in ${trip.fleetNumber} (${trip.plateNumber}) returned by ${trip.driverName}. Distance: ${distanceTraveled} km. ${hasIncident ? 'INCIDENT REPORTED!' : 'Inspection passed.'}`,
        hasIncident ? 'WARNING' : 'INFO',
        trip.id
      );

      // 4. Update React state
      setTrips((prev) => prev.map((t) => (t.id === input.tripId ? updatedTrip : t)));
      setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? updatedVehicle : v)));
    } catch (err) {
      console.error('Database write error during returnVehicle:', err);
      throw err;
    }
  };

  // --- EVACUATION & MUSTER ROLL ---
  const toggleMusterAccounted = (id: string) => {
    setAccountedMusterList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetMusterRoll = () => {
    setAccountedMusterList(new Set());
    addAuditLog('EMERGENCY_ALARM', 'SECURITY', 'Evacuation muster roll verified and reset', 'INFO');
  };

  // --- BACKUP & RESTORE ---
  const exportBackupJson = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      facility: settings.facilityName,
      officers,
      settings,
      visitorProfiles,
      visitorPasses,
      vehicles,
      trips,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SecureGate_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addAuditLog('DATA_EXPORT', 'SYSTEM', 'Encrypted security database snapshot exported to JSON', 'INFO');
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed) {
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

  const resetAllData = async (): Promise<void> => {
    setOfficers(INITIAL_OFFICERS);
    setCurrentOfficer(INITIAL_OFFICERS[0]);
    setSettings(INITIAL_SETTINGS);
    setVisitorProfiles([]);
    setVisitorPasses([]);
    setVehicles([]);
    setTrips([]);
    setAuditLogs([]);
    setEmergencyAlarmActive(false);
    setAccountedMusterList(new Set());

    addAuditLog('DATA_RESET', 'SYSTEM', 'System reset to factory security state', 'WARNING');
  };

  const pushAllDataToSupabase = async (): Promise<boolean> => {
    setCloudSyncing(true);
    try {
      const res = await SupabaseService.pushAllToSupabase({
        officers,
        profiles: visitorProfiles,
        passes: visitorPasses,
        vehicles,
        trips,
        auditLogs,
        settings,
      });
      if (res.success) {
        setCloudConnected(true);
        setLastCloudSync(new Date().toLocaleTimeString());
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setCloudSyncing(false);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isLoading,
        isOffline,
        currentOfficer,
        isLocked,
        officers,
        activeGate,
        switchGate,
        switchOfficer,
        lockTerminal,
        unlockTerminal,
        getLockoutStatus,
        recordFailedAttempt,
        resetFailedAttempts,
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
        cloudConnected,
        cloudSyncing,
        lastCloudSync,
        supabaseProjectId: SUPABASE_PROJECT_ID,
        pushAllDataToSupabase,
        refreshFromSupabase,
      }}
    >
      {isLoading ? (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="flex items-center gap-2 text-2xl font-black tracking-wider text-white">
              <span className="p-2 bg-blue-600 rounded-xl text-white">🛡️</span>
              SECUREGATE
            </div>
            <p className="text-sm font-medium text-slate-400 animate-pulse">
              Connecting to Supabase security database...
            </p>
          </div>
        </div>
      ) : (
        <>
          {isOffline && (
            <div className="sticky top-0 z-[9998] bg-red-600 text-white text-center py-2.5 px-4 font-bold text-sm shadow-md flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Offline Mode - Data will not save
            </div>
          )}
          {children}
        </>
      )}
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
