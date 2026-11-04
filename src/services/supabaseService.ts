import { supabase } from '../lib/supabase';
import { SecurityOfficer } from '../types/auth';
import { OrgSettings } from '../types/settings';
import { VisitorProfile, VisitorPass } from '../types/visitor';
import { OrgVehicle, VehicleTrip } from '../types/vehicle';
import { AuditLogEntry } from '../types/audit';

export class SupabaseService {
  /**
   * Universal backup save to `securegate_store` key-value table.
   * Keeps a synchronized copy of collection data in Supabase.
   */
  static async saveStoreCollection<T>(key: string, data: T): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('securegate_store')
        .upsert({ key, data: data as any, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch collection from `securegate_store` key-value table.
   */
  static async fetchStoreCollection<T>(key: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from('securegate_store')
        .select('data')
        .eq('key', key)
        .maybeSingle();
      if (!error && data && data.data) {
        return data.data as T;
      }
      return null;
    } catch {
      return null;
    }
  }

  // --- 1. OFFICERS ---
  static async fetchOfficers(): Promise<SecurityOfficer[] | null> {
    try {
      const { data, error } = await supabase.from('officers').select('*').order('name');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          badgeNumber: row.badge_number,
          role: row.role,
          pin: row.pin,
          email: row.email,
          assignedGate: row.assigned_gate,
          active: row.active ?? true,
          avatarUrl: row.avatar_url || '',
          lastLogin: row.last_login || new Date().toISOString(),
        }));
      }
      return await this.fetchStoreCollection<SecurityOfficer[]>('officers');
    } catch {
      return null;
    }
  }

  static async upsertOfficer(officer: SecurityOfficer): Promise<void> {
    const { error } = await supabase.from('officers').upsert({
      id: officer.id,
      name: officer.name,
      badge_number: officer.badgeNumber,
      role: officer.role,
      pin: officer.pin,
      email: officer.email,
      assigned_gate: officer.assignedGate,
      active: officer.active,
      avatar_url: officer.avatarUrl,
      last_login: officer.lastLogin,
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsertOfficer error:', error);
      throw error;
    }
  }

  static async deleteOfficer(id: string): Promise<void> {
    const { error } = await supabase.from('officers').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteOfficer error:', error);
      throw error;
    }
  }

  // --- 2. VISITOR PASSES ---
  static async fetchPasses(): Promise<VisitorPass[] | null> {
    try {
      const { data, error } = await supabase.from('visitor_passes').select('*').order('entry_time', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          visitorProfileId: row.visitor_id || '',
          badgeNumber: row.badge_number,
          visitorName: row.visitor_name,
          visitorCompany: row.visitor_company || '',
          visitorPhone: '',
          visitorEmail: '',
          idType: 'National ID',
          idNumber: '',
          photoUrl: '',
          hostName: row.host_name,
          hostDepartment: row.host_department,
          purpose: row.purpose,
          entryTime: row.entry_time,
          expectedDurationHours: 4,
          expectedDepartureTime: row.expected_departure_time,
          actualDepartureTime: row.actual_departure_time,
          status: row.status,
          entryGate: row.checkpoint_name || 'Gate 1 - Main North Entrance',
          exitGate: row.checkpoint_name,
          escortRequired: false,
          safetyInductionCompleted: true,
          ndaAccepted: true,
          assetsCarried: Array.isArray(row.carried_assets) ? row.carried_assets : [],
          vehiclePlate: row.vehicle_plate,
          parkingBay: '',
          officerCheckInId: 'off-01',
          officerCheckInName: row.officer_check_in_name || 'Security Officer',
          officerCheckOutId: undefined,
          officerCheckOutName: row.officer_check_out_name,
          checkOutNotes: undefined,
          qrCodeDataUrl: undefined,
        }));
      }
      return await this.fetchStoreCollection<VisitorPass[]>('passes');
    } catch {
      return null;
    }
  }

  static async upsertPass(pass: VisitorPass): Promise<void> {
    const { error } = await supabase.from('visitor_passes').upsert({
      id: pass.id,
      badge_number: pass.badgeNumber,
      visitor_id: pass.visitorProfileId,
      visitor_name: pass.visitorName,
      visitor_company: pass.visitorCompany,
      host_name: pass.hostName,
      host_department: pass.hostDepartment,
      purpose: pass.purpose,
      entry_time: pass.entryTime,
      expected_departure_time: pass.expectedDepartureTime || new Date().toISOString(),
      actual_departure_time: pass.actualDepartureTime,
      status: pass.status,
      checkpoint_name: pass.entryGate || 'Gate 1',
      carried_assets: pass.assetsCarried || [],
      vehicle_plate: pass.vehiclePlate,
      officer_check_in_name: pass.officerCheckInName,
      officer_check_out_name: pass.officerCheckOutName,
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsertPass error:', error);
      throw error;
    }
  }

  // --- 3. VISITOR PROFILES ---
  static async fetchProfiles(): Promise<VisitorProfile[] | null> {
    try {
      const { data, error } = await supabase.from('visitor_profiles').select('*').order('full_name');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          idType: 'National ID',
          idNumber: row.national_id || '',
          phoneNumber: row.phone || '',
          email: row.email || '',
          company: row.company || '',
          photoUrl: row.photo_url,
          isWatchlisted: row.blacklisted ?? false,
          watchlistReason: row.blacklist_reason,
          vip: false,
          totalVisits: row.total_visits || 1,
          firstRegisteredAt: row.created_at || new Date().toISOString(),
          lastVisitDate: row.last_visit_date || new Date().toISOString(),
          defaultVehiclePlate: row.vehicle_plate,
          notes: '',
        }));
      }
      return await this.fetchStoreCollection<VisitorProfile[]>('profiles');
    } catch {
      return null;
    }
  }

  static async upsertProfile(profile: VisitorProfile): Promise<void> {
    const { error } = await supabase.from('visitor_profiles').upsert({
      id: profile.id,
      full_name: profile.fullName,
      national_id: profile.idNumber,
      phone: profile.phoneNumber,
      email: profile.email,
      company: profile.company,
      photo_url: profile.photoUrl,
      vehicle_plate: profile.defaultVehiclePlate,
      blacklisted: profile.isWatchlisted,
      blacklist_reason: profile.watchlistReason,
      total_visits: profile.totalVisits,
      last_visit_date: profile.lastVisitDate,
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsertProfile error:', error);
      throw error;
    }
  }

  // --- 4. VEHICLES ---
  static async fetchVehicles(): Promise<OrgVehicle[] | null> {
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('fleet_number');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          fleetNumber: row.fleet_number,
          plateNumber: row.plate_number,
          makeModel: row.make_model,
          year: row.year || 2024,
          type: row.type || 'Sedan',
          assignedDepartment: row.assigned_department || 'Fleet Operations',
          currentOdometer: row.current_odometer || 0,
          fuelLevelPercent: row.fuel_level_percent ?? 100,
          lastInspectionDate: row.last_inspection_date,
          condition: row.condition || 'Good',
          status: row.status || 'AVAILABLE',
          assignedDriver: undefined,
          notes: row.notes,
        }));
      }
      return await this.fetchStoreCollection<OrgVehicle[]>('vehicles');
    } catch {
      return null;
    }
  }

  static async upsertVehicle(v: OrgVehicle): Promise<void> {
    const { error } = await supabase.from('vehicles').upsert({
      id: v.id,
      fleet_number: v.fleetNumber,
      plate_number: v.plateNumber,
      make_model: v.makeModel,
      year: v.year,
      type: v.type,
      assigned_department: v.assignedDepartment,
      current_odometer: v.currentOdometer,
      fuel_level_percent: v.fuelLevelPercent,
      last_inspection_date: v.lastInspectionDate,
      condition: v.condition,
      status: v.status,
      notes: v.notes,
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsertVehicle error:', error);
      throw error;
    }
  }

  // --- 5. VEHICLE TRIPS ---
  static async fetchTrips(): Promise<VehicleTrip[] | null> {
    try {
      const { data, error } = await supabase.from('trips').select('*').order('departure_time', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          tripPassNumber: row.trip_pass_number,
          vehicleId: row.vehicle_id,
          fleetNumber: row.fleet_number,
          plateNumber: row.plate_number,
          makeModel: row.make_model || 'Fleet Vehicle',
          driverName: row.driver_name,
          driverEmployeeId: row.driver_staff_id || '',
          driverLicenseNumber: '',
          driverPhone: '',
          destination: row.destination,
          purpose: row.purpose,
          passengersList: '',
          department: 'Operations',
          departureTime: row.departure_time,
          expectedReturnTime: row.actual_return_time || row.departure_time,
          actualReturnTime: row.actual_return_time,
          departureOdometer: row.departure_odometer || 0,
          returnOdometer: row.return_odometer,
          distanceTraveledKm: row.return_odometer ? Math.max(0, row.return_odometer - (row.departure_odometer || 0)) : undefined,
          departureFuelPercent: row.departure_fuel_percent ?? 100,
          returnFuelPercent: row.return_fuel_percent,
          departureGate: 'Gate 1',
          returnGate: undefined,
          status: row.status,
          departureChecklist: row.departure_checklist || {
            lightsOk: true,
            tiresConditionOk: true,
            bodyScratchesChecked: true,
            interiorClean: true,
            spareWheelToolsPresent: true,
            safetyTrianglesFireExtinguisher: true,
            fuelConfirmed: true,
          },
          returnChecklist: row.return_checklist,
          officerDepartureId: 'off-01',
          officerDepartureName: row.officer_check_out_name || 'Officer',
          officerReturnId: undefined,
          officerReturnName: row.officer_check_in_name,
          tripNotes: row.trip_notes,
        }));
      }
      return await this.fetchStoreCollection<VehicleTrip[]>('trips');
    } catch {
      return null;
    }
  }

  static async upsertTrip(trip: VehicleTrip): Promise<void> {
    const { error } = await supabase.from('trips').upsert({
      id: trip.id,
      trip_pass_number: trip.tripPassNumber,
      vehicle_id: trip.vehicleId,
      fleet_number: trip.fleetNumber,
      plate_number: trip.plateNumber,
      driver_name: trip.driverName,
      driver_staff_id: trip.driverEmployeeId,
      destination: trip.destination,
      purpose: trip.purpose,
      departure_time: trip.departureTime,
      actual_return_time: trip.actualReturnTime,
      departure_odometer: trip.departureOdometer,
      return_odometer: trip.returnOdometer,
      departure_fuel_percent: trip.departureFuelPercent,
      return_fuel_percent: trip.returnFuelPercent,
      status: trip.status,
      officer_check_in_name: trip.officerReturnName,
      officer_check_out_name: trip.officerDepartureName,
      trip_notes: trip.tripNotes,
      departure_checklist: trip.departureChecklist,
      return_checklist: trip.returnChecklist,
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsertTrip error:', error);
      throw error;
    }
  }

  // --- 6. AUDIT LOGS ---
  static async fetchAuditLogs(): Promise<AuditLogEntry[] | null> {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          timestamp: row.timestamp,
          officerId: row.officer_id,
          officerName: row.officer_name,
          action: row.action,
          targetType: row.target_type,
          targetId: row.target_id,
          details: row.details,
          severity: row.severity,
          gate: row.gate,
        }));
      }
      return await this.fetchStoreCollection<AuditLogEntry[]>('audit');
    } catch {
      return null;
    }
  }

  static async insertAuditLog(log: AuditLogEntry): Promise<void> {
    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      officer_id: log.officerId,
      officer_name: log.officerName,
      action: log.action,
      target_type: log.targetType,
      target_id: log.targetId,
      details: log.details,
      severity: log.severity,
      gate: log.gate,
    });
    if (error) {
      console.error('Supabase insertAuditLog error:', error);
      throw error;
    }
  }

  // --- 7. SETTINGS ---
  static async fetchSettings(): Promise<OrgSettings | null> {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'current_org_settings').maybeSingle();
      if (!error && data) {
        return {
          organizationName: data.organization_name || 'SECUREGATE',
          organizationShortName: data.organization_short_name || 'SECUREGATE',
          facilityName: data.facility_name || 'Main Compound & Industrial Campus',
          facilityAddress: data.facility_address || '400 Enterprise Parkway',
          securityOfficePhone: data.security_office_phone || '+1 (555) 782-9900',
          emergencyHotline: data.emergency_hotline || 'Ext 911 / Speed Dial 1',
          gates: data.gates || [],
          currentGateId: (data.gates && data.gates[0]?.id) || 'gate-1',
          visitorBadgePrefix: data.config_data?.visitorBadgePrefix || 'VIS-',
          defaultVisitorDurationHours: data.config_data?.defaultVisitorDurationHours || 4,
          overstayAlertMinutes: data.config_data?.overstayAlertMinutes || 15,
          maxPremiseCapacity: data.config_data?.maxPremiseCapacity || 250,
          requirePhotoCapture: data.config_data?.requirePhotoCapture ?? true,
          requireGovernmentId: data.config_data?.requireGovernmentId ?? true,
          requireSafetyBriefing: data.config_data?.requireSafetyBriefing ?? false,
          requireVehicleInspection: data.config_data?.requireVehicleInspection ?? true,
          companyDepartments: data.config_data?.companyDepartments || ['Operations', 'IT', 'Security'],
        };
      }
      return await this.fetchStoreCollection<OrgSettings>('settings');
    } catch {
      return null;
    }
  }

  static async upsertSettings(settings: OrgSettings): Promise<void> {
    const { error } = await supabase.from('settings').upsert({
      id: 'current_org_settings',
      organization_name: settings.organizationName,
      organization_short_name: settings.organizationShortName,
      facility_name: settings.facilityName,
      facility_address: settings.facilityAddress,
      security_office_phone: settings.securityOfficePhone,
      emergency_hotline: settings.emergencyHotline,
      gates: settings.gates as any,
      config_data: {
        visitorBadgePrefix: settings.visitorBadgePrefix,
        defaultVisitorDurationHours: settings.defaultVisitorDurationHours,
        overstayAlertMinutes: settings.overstayAlertMinutes,
        maxPremiseCapacity: settings.maxPremiseCapacity,
        requirePhotoCapture: settings.requirePhotoCapture,
        requireGovernmentId: settings.requireGovernmentId,
        requireSafetyBriefing: settings.requireSafetyBriefing,
        requireVehicleInspection: settings.requireVehicleInspection,
        companyDepartments: settings.companyDepartments,
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) {
      console.error('Supabase upsertSettings error:', error);
      throw error;
    }
  }

  /**
   * Pushes entire current app memory/state into Supabase.
   */
  static async pushAllToSupabase(payload: {
    officers: SecurityOfficer[];
    profiles: VisitorProfile[];
    passes: VisitorPass[];
    vehicles: OrgVehicle[];
    trips: VehicleTrip[];
    auditLogs: AuditLogEntry[];
    settings: OrgSettings;
  }): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    await this.saveStoreCollection('officers', payload.officers);
    await this.saveStoreCollection('profiles', payload.profiles);
    await this.saveStoreCollection('passes', payload.passes);
    await this.saveStoreCollection('vehicles', payload.vehicles);
    await this.saveStoreCollection('trips', payload.trips);
    await this.saveStoreCollection('audit', payload.auditLogs);
    await this.saveStoreCollection('settings', payload.settings);

    try {
      for (const off of payload.officers) {
        await this.upsertOfficer(off);
      }
    } catch (e: any) {
      errors.push(`Officers sync: ${e?.message}`);
    }

    try {
      for (const p of payload.profiles) {
        await this.upsertProfile(p);
      }
    } catch (e: any) {
      errors.push(`Profiles sync: ${e?.message}`);
    }

    try {
      for (const pass of payload.passes) {
        await this.upsertPass(pass);
      }
    } catch (e: any) {
      errors.push(`Passes sync: ${e?.message}`);
    }

    try {
      for (const v of payload.vehicles) {
        await this.upsertVehicle(v);
      }
    } catch (e: any) {
      errors.push(`Vehicles sync: ${e?.message}`);
    }

    try {
      for (const t of payload.trips) {
        await this.upsertTrip(t);
      }
    } catch (e: any) {
      errors.push(`Trips sync: ${e?.message}`);
    }

    try {
      for (const a of payload.auditLogs.slice(0, 50)) {
        await this.insertAuditLog(a);
      }
    } catch (e: any) {
      errors.push(`Audit sync: ${e?.message}`);
    }

    try {
      await this.upsertSettings(payload.settings);
    } catch (e: any) {
      errors.push(`Settings sync: ${e?.message}`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}
