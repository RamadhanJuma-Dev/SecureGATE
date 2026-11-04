export type AuditAction = 
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_SWITCH_GATE'
  | 'VISITOR_REGISTER'
  | 'VISITOR_CHECKIN'
  | 'VISITOR_CHECKOUT'
  | 'RETURNING_VISITOR_REUSE'
  | 'VEHICLE_ADD'
  | 'VEHICLE_UPDATE'
  | 'VEHICLE_CHECKOUT'
  | 'VEHICLE_CHECKIN'
  | 'WATCHLIST_TOGGLE'
  | 'SETTINGS_UPDATE'
  | 'DATA_EXPORT'
  | 'DATA_RESET'
  | 'EMERGENCY_MUSTER_INITIATED';

export type AuditSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'ALERT';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  officerId: string;
  officerName: string;
  gate: string;
  action: AuditAction;
  targetType: 'VISITOR' | 'VEHICLE' | 'SYSTEM' | 'SECURITY';
  targetId?: string;
  details: string;
  severity: AuditSeverity;
}
