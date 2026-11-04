export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'OFFICER' | 'GUARD' | 'MANAGEMENT';

export interface SecurityOfficer {
  id: string;
  name: string;
  badgeNumber: string;
  role: UserRole;
  pin: string;
  email?: string;
  assignedGate: string;
  active: boolean;
  avatarUrl?: string;
  lastLogin: string;
}

export interface AuthSession {
  currentOfficer: SecurityOfficer;
  currentGateId: string;
  currentGateName: string;
  isLocked: boolean;
  loginTime: string;
}

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return 'System Administrator';
    case 'SUPERVISOR':
      return 'Security Supervisor';
    case 'OFFICER':
    case 'GUARD':
      return 'Security Officer';
    case 'MANAGEMENT':
      return 'Management';
    default:
      return 'User';
  }
};

export const getRoleDashboardName = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return 'System Administration Dashboard';
    case 'SUPERVISOR':
      return 'Security Operations Dashboard';
    case 'OFFICER':
    case 'GUARD':
      return 'Gate Operations Dashboard';
    case 'MANAGEMENT':
      return 'Management Overview Dashboard';
    default:
      return 'Dashboard';
  }
};
