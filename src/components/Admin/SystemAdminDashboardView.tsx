import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Truck, 
  Sliders, 
  FileText, 
  Database, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Search, 
  Download, 
  RotateCcw, 
  Save, 
  UserPlus, 
  Eye, 
  Check, 
  KeyRound, 
  ShieldAlert,
  Key
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { UserRole, getRoleDisplayName } from '../../types/auth';

interface SystemAdminDashboardViewProps {
  onLogout: () => void;
}

export const SystemAdminDashboardView: React.FC<SystemAdminDashboardViewProps> = ({
  onLogout,
}) => {
  const {
    currentOfficer,
    officers,
    addOfficer,
    deleteOfficer,
    toggleOfficerActive,
    changeOfficerRole,
    settings,
    updateSettings,
    vehicles,
    addVehicle,
    auditLogs,
    exportBackupJson,
    resetAllData,
  } = useSecurity();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'users' | 'org' | 'policies' | 'fleet' | 'audit' | 'backup'>('users');

  // Filter state for users
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  // Modal State: Create User
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserBadge, setNewUserBadge] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('OFFICER');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserGate, setNewUserGate] = useState(settings.gates[0]?.name || 'Gate 1 - Main North Entrance');
  const [userModalError, setUserModalError] = useState('');

  // Org Settings State
  const [orgName, setOrgName] = useState(settings.organizationName);
  const [orgShortName, setOrgShortName] = useState(settings.organizationShortName);
  const [facilityName, setFacilityName] = useState(settings.facilityName);
  const [facilityAddress, setFacilityAddress] = useState(settings.facilityAddress);
  const [phone, setPhone] = useState(settings.securityOfficePhone);
  const [emergencyPhone, setEmergencyPhone] = useState(settings.emergencyHotline);
  const [gatesList, setGatesList] = useState(settings.gates);
  const [newGateName, setNewGateName] = useState('');
  const [newGateType, setNewGateType] = useState<'COMBINED' | 'VEHICULAR' | 'PEDESTRIAN'>('COMBINED');

  // Registration Policies State
  const [requirePhoto, setRequirePhoto] = useState(settings.requirePhotoCapture);
  const [requireId, setRequireId] = useState(settings.requireGovernmentId);
  const [requireBriefing, setRequireBriefing] = useState(settings.requireSafetyBriefing);
  const [requireVehInspection, setRequireVehInspection] = useState(settings.requireVehicleInspection);
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultVisitorDurationHours);
  const [overstayMinutes, setOverstayMinutes] = useState(settings.overstayAlertMinutes);
  const [maxCapacity, setMaxCapacity] = useState(settings.maxPremiseCapacity);
  const [badgePrefix, setBadgePrefix] = useState(settings.visitorBadgePrefix);

  // Modal State: Add Vehicle
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newFleetNumber, setNewFleetNumber] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newMakeModel, setNewMakeModel] = useState('');
  const [newCategory, setNewCategory] = useState<'CAR' | 'VAN' | 'TRUCK' | 'BUS'>('CAR');
  const [newAssignedDept, setNewAssignedDept] = useState(settings.companyDepartments[0] || 'Operations');
  const [newOdometer, setNewOdometer] = useState(15000);

  // Notification toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    if (!newUserName.trim() || !newUserBadge.trim() || !newUserPin.trim()) {
      setUserModalError('Name, Staff/Badge Number, and Security PIN are required.');
      return;
    }

    if (officers.some(o => o.badgeNumber.toLowerCase() === newUserBadge.trim().toLowerCase())) {
      setUserModalError(`An account with badge ${newUserBadge} already exists.`);
      return;
    }

    addOfficer({
      name: newUserName.trim(),
      badgeNumber: newUserBadge.trim(),
      role: newUserRole,
      pin: newUserPin.trim(),
      email: newUserEmail.trim(),
      assignedGate: newUserGate,
      active: true,
      avatarUrl: '',
    });

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserBadge('');
    setNewUserPin('');
    setNewUserEmail('');
    showNotification(`User account created for ${newUserName} (${getRoleDisplayName(newUserRole)})`);
  };

  const handleSaveOrgSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      organizationName: orgName.trim() || 'SECUREGATE',
      organizationShortName: orgShortName.trim() || 'SECUREGATE',
      facilityName: facilityName.trim(),
      facilityAddress: facilityAddress.trim(),
      securityOfficePhone: phone.trim(),
      emergencyHotline: emergencyPhone.trim(),
      gates: gatesList,
    });
    showNotification('Organizational identity and checkpoint configuration saved.');
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      visitorBadgePrefix: badgePrefix.trim() || 'VIS-',
      defaultVisitorDurationHours: defaultDuration,
      overstayAlertMinutes: overstayMinutes,
      maxPremiseCapacity: maxCapacity,
      requirePhotoCapture: requirePhoto,
      requireGovernmentId: requireId,
      requireSafetyBriefing: requireBriefing,
      requireVehicleInspection: requireVehInspection,
    });
    showNotification('Visitor registration policies successfully updated.');
  };

  const handleAddGate = () => {
    if (!newGateName.trim()) return;
    const newGate = {
      id: `gate-${Date.now()}`,
      name: newGateName.trim(),
      type: newGateType,
      active: true,
    };
    setGatesList([...gatesList, newGate]);
    setNewGateName('');
  };

  const handleRemoveGate = (id: string) => {
    if (gatesList.length <= 1) {
      alert('At least one gate checkpoint is required.');
      return;
    }
    setGatesList(gatesList.filter(g => g.id !== id));
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFleetNumber.trim() || !newPlate.trim() || !newMakeModel.trim()) return;
    addVehicle({
      fleetNumber: newFleetNumber.trim().toUpperCase(),
      plateNumber: newPlate.trim().toUpperCase(),
      makeModel: newMakeModel.trim(),
      year: new Date().getFullYear(),
      type: newCategory === 'TRUCK' ? 'Heavy Box Truck' : newCategory === 'VAN' ? 'Cargo Van' : newCategory === 'BUS' ? 'Staff Shuttle / Bus' : 'Sedan',
      assignedDepartment: newAssignedDept,
      currentOdometer: Number(newOdometer) || 0,
      fuelLevelPercent: 100,
      lastInspectionDate: new Date().toISOString(),
      condition: 'Excellent',
      notes: 'Initial registration by system administrator',
    });
    setIsAddVehicleOpen(false);
    setNewFleetNumber('');
    setNewPlate('');
    setNewMakeModel('');
    showNotification(`Vehicle ${newFleetNumber.toUpperCase()} added to fleet.`);
  };

  const filteredOfficers = officers.filter(o => {
    if (roleFilter !== 'ALL' && o.role !== roleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.badgeNumber.toLowerCase().includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        o.assignedGate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const initials = currentOfficer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'MV';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] via-[#edf6fd] to-[#e0f0fe] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 font-sans text-slate-800 select-none">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Administrator Profile Card (Unified with Gatekeeper style) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {currentOfficer.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wide uppercase">
                  SYSTEM ADMINISTRATOR
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 tracking-wide uppercase hidden sm:inline-block">
                  {settings.organizationShortName || settings.organizationName || 'SECUREGATE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Staff ID: {currentOfficer.badgeNumber} • RBAC & System Administration Control Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#d32f2f] hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Navigation Tabs (Pill style matching uniform aesthetic) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & RBAC ({officers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('org')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'org'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organization & Gates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'policies'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Registration Policies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Vehicle Categories & Fleet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>System Maintenance</span>
          </button>
        </div>

        {/* TAB 1: USERS & RBAC PERMISSIONS */}
        {activeTab === 'users' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-sm">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search personnel by name, staff ID, email..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="SUPERVISOR">Security Supervisor</option>
                  <option value="OFFICER">Security Officer</option>
                  <option value="MANAGEMENT">Management</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User Account</span>
              </button>
            </div>

            {/* Role Responsibilities Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-indigo-700 font-bold text-xs">
                  <span>1. Administrator</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Full system control, user account provisioning, RBAC role assignment, policy rules, and system configuration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
                  <span>2. Supervisor</span>
                  <Eye className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Operational visibility, live compound monitoring, vehicle returns review, guard activity audit, and investigation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-sky-700 font-bold text-xs">
                  <span>3. Security Officer</span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Simplified Gate Operations: register guests, ID search, vehicle checkout/checkin, mileage and condition recording.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-purple-700 font-bold text-xs">
                  <span>4. Management</span>
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Read-only operational intelligence: security statistics, visitor analytics, fleet utilization, and executive export.
                </p>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50/70 text-slate-600 font-semibold border-b border-sky-100">
                    <tr>
                      <th className="px-5 py-3.5">User / Staff</th>
                      <th className="px-4 py-3.5">Assigned Role</th>
                      <th className="px-4 py-3.5">Staff ID</th>
                      <th className="px-4 py-3.5">Gate / Location</th>
                      <th className="px-4 py-3.5">Account Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100/60 font-medium">
                    {filteredOfficers.map((officer) => {
                      const isSelf = officer.id === currentOfficer.id;
                      const roleBadgeColor = 
                        officer.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        officer.role === 'SUPERVISOR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        officer.role === 'MANAGEMENT' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-sky-50 text-sky-700 border-sky-200';

                      return (
                        <tr key={officer.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center font-bold text-sky-700 shrink-0">
                                {officer.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{officer.name}</span>
                                  {isSelf && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">
                                      (You)
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {officer.email || `${officer.badgeNumber}@securegate.local`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role Selector */}
                          <td className="px-4 py-3.5">
                            <select
                              value={officer.role}
                              disabled={isSelf}
                              onChange={(e) => changeOfficerRole(officer.id, e.target.value as UserRole)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${roleBadgeColor}`}
                            >
                              <option value="ADMIN">System Administrator</option>
                              <option value="SUPERVISOR">Security Supervisor</option>
                              <option value="OFFICER">Security Officer</option>
                              <option value="MANAGEMENT">Management (Read-Only)</option>
                            </select>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">
                            {officer.badgeNumber}
                          </td>

                          <td className="px-4 py-3.5 text-slate-600">
                            {officer.assignedGate || 'Main Gate'}
                          </td>

                          {/* Active / Deactivated Status */}
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => toggleOfficerActive(officer.id)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                                officer.active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {officer.active ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Deactivated</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete account for ${officer.name}?`)) {
                                    deleteOfficer(officer.id);
                                    showNotification(`Deleted account ${officer.name}`);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORGANIZATION & CHECKPOINTS */}
        {activeTab === 'org' && (
          <form onSubmit={handleSaveOrgSettings} className="space-y-6">
            <div className="bg-white rounded-3xl border border-sky-100 p-6 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-sky-600" />
                <span>Organizational Identity & Branding</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Organization Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Displayed on login page, system headers, and reports.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Organization Short Name / Acronym *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgShortName}
                    onChange={(e) => setOrgShortName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used for fleet labels (e.g. &quot;{orgShortName} Vehicle Check Ins&quot;).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Facility / Campus Name
                  </label>
                  <input
                    type="text"
                    required
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={facilityAddress}
                    onChange={(e) => setFacilityAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Security Office Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Emergency Security Hotline
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-rose-700 font-mono font-bold focus:outline-none focus:bg-white focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Checkpoint Gates */}
            <div className="bg-white rounded-3xl border border-sky-100 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-sky-600" />
                  <span>Configured Gate Checkpoints ({gatesList.length})</span>
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gatesList.map((gate) => (
                  <div key={gate.id} className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{gate.name}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {gate.type}
                      </span>
                    </div>
                    {gatesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGate(gate.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Gate Form */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="New gate name (e.g. Gate 4 - South Entrance)..."
                  value={newGateName}
                  onChange={(e) => setNewGateName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500"
                />
                <select
                  value={newGateType}
                  onChange={(e) => setNewGateType(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                >
                  <option value="COMBINED">Combined (Pedestrian & Vehicle)</option>
                  <option value="VEHICULAR">Vehicular Only</option>
                  <option value="PEDESTRIAN">Pedestrian Only</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddGate}
                  className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Gate</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/25 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: REGISTRATION POLICIES */}
        {activeTab === 'policies' && (
          <form onSubmit={handleSavePolicies} className="space-y-6">
            <div className="bg-white rounded-3xl border border-sky-100 p-6 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-sky-600" />
                <span>Visitor Registration Policies & Thresholds</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Visitor Badge Number Prefix
                  </label>
                  <input
                    type="text"
                    required
                    value={badgePrefix}
                    onChange={(e) => setBadgePrefix(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-semibold focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Default Visit Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={defaultDuration}
                    onChange={(e) => setDefaultDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Overstay Warning Threshold (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={overstayMinutes}
                    onChange={(e) => setOverstayMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Max Compound Capacity (Persons)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Mandatory Checklist Rules */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Mandatory Security Verification Checks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between cursor-pointer hover:border-sky-300 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">Require Visitor Photo Capture</p>
                      <p className="text-[11px] text-slate-500">Take portrait photo at registration desk</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requirePhoto}
                      onChange={(e) => setRequirePhoto(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-white border-slate-300"
                    />
                  </label>

                  <label className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between cursor-pointer hover:border-sky-300 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">Require Government ID Verification</p>
                      <p className="text-[11px] text-slate-500">National ID, Passport, or Driver License</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireId}
                      onChange={(e) => setRequireId(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-white border-slate-300"
                    />
                  </label>

                  <label className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between cursor-pointer hover:border-sky-300 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">Require Safety Briefing Acknowledgment</p>
                      <p className="text-[11px] text-slate-500">Emergency exits and protocol confirmation</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireBriefing}
                      onChange={(e) => setRequireBriefing(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-white border-slate-300"
                    />
                  </label>

                  <label className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between cursor-pointer hover:border-sky-300 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900">Require Vehicle Physical Inspection</p>
                      <p className="text-[11px] text-slate-500">Boot, undercarriage, and mirror check</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireVehInspection}
                      onChange={(e) => setRequireVehInspection(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-0 bg-white border-slate-300"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/25 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Registration Policies</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: VEHICLE CATEGORIES & FLEET */}
        {activeTab === 'fleet' && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">Organizational Vehicle Registry</h2>
                <p className="text-xs text-slate-500">Manage company vehicle fleet, plate numbers, and assigned categories</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddVehicleOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Fleet Vehicle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div key={v.id} className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-700 text-sm">
                      {v.fleetNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : v.status === 'ON_TRIP'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">{v.makeModel}</p>
                    <p className="text-xs font-mono text-slate-500">Plate: {v.plateNumber}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Dept: {v.assignedDepartment}</span>
                    <span className="font-mono">{v.currentOdometer.toLocaleString()} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Full Security Audit Logs</h2>
                <p className="text-xs text-slate-500">Immutable trail of personnel actions, gate logins, and rule updates</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
                {auditLogs.length} logged events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50/70 text-slate-600 font-semibold border-b border-sky-100">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Officer</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100/60 font-mono text-[11px]">
                  {auditLogs.slice(0, 30).map((log) => (
                    <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900 font-medium">
                        {log.officerName}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{log.targetType}</td>
                      <td className="px-4 py-2.5 text-slate-700 truncate max-w-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM MAINTENANCE */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-3xl border border-sky-100 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-600" />
                <span>Export System Data Backup</span>
              </h2>
              <p className="text-xs text-slate-500">
                Download a complete JSON snapshot of all user accounts, visitor records, vehicle dispatches, and configuration settings.
              </p>
              <button
                type="button"
                onClick={exportBackupJson}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Secure JSON Backup</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-rose-200 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <span>Reset to Factory State</span>
              </h2>
              <p className="text-xs text-slate-500">
                Resets the system database back to initial seed data. All temporary test passes and records will be replaced with baseline test data.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data to default demo state?')) {
                    resetAllData();
                    showNotification('System database reset to initial demonstration state.');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All System Data</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-sky-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <span>Create User Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {userModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{userModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Samuel K. Ruto"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Staff ID / Badge # *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    placeholder="e.g. 130 or SEC-090"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Security PIN *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned RBAC Role *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                >
                  <option value="OFFICER">Security Officer (Gate Operations)</option>
                  <option value="SUPERVISOR">Security Supervisor (Operations Overview)</option>
                  <option value="MANAGEMENT">Management (Read-Only Executive)</option>
                  <option value="ADMIN">System Administrator (Full Privileges)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Determines the landing dashboard and operational capabilities.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. officer@securegate.local"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Post / Gate Checkpoint
                </label>
                <select
                  value={newUserGate}
                  onChange={(e) => setNewUserGate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                >
                  {settings.gates.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                  <option value="Executive Headquarters Suite">Executive Headquarters Suite</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE VEHICLE MODAL */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-sky-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between bg-sky-50/60">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <span>Register Fleet Vehicle</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddVehicleOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fleet Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFleetNumber}
                    onChange={(e) => setNewFleetNumber(e.target.value)}
                    placeholder="e.g. FL-09"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="e.g. KDF 450M"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Make & Model *
                </label>
                <input
                  type="text"
                  required
                  value={newMakeModel}
                  onChange={(e) => setNewMakeModel(e.target.value)}
                  placeholder="e.g. Toyota Hilux Double Cab"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vehicle Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer font-medium"
                  >
                    <option value="CAR">Light Passenger Car</option>
                    <option value="VAN">Operational Van</option>
                    <option value="TRUCK">Heavy Logistics Truck</option>
                    <option value="BUS">Staff Bus / Shuttle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={newOdometer}
                    onChange={(e) => setNewOdometer(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Department
                </label>
                <select
                  value={newAssignedDept}
                  onChange={(e) => setNewAssignedDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer font-medium"
                >
                  {settings.companyDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
