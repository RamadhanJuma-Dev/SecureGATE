import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Sliders, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2,
  Users
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportBackupJson, 
    importBackupJson, 
    resetAllData,
    officers
  } = useSecurity();

  // Local draft states
  const [orgName, setOrgName] = useState(settings.organizationName || 'SECUREGATE');
  const [orgShortName, setOrgShortName] = useState(settings.organizationShortName || 'SECUREGATE');
  const [facilityName, setFacilityName] = useState(settings.facilityName);
  const [facilityAddress, setFacilityAddress] = useState(settings.facilityAddress);
  const [securityOfficePhone, setSecurityOfficePhone] = useState(settings.securityOfficePhone);
  const [emergencyHotline, setEmergencyHotline] = useState(settings.emergencyHotline);
  const [badgePrefix, setBadgePrefix] = useState(settings.visitorBadgePrefix);
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultVisitorDurationHours);
  const [maxCapacity, setMaxCapacity] = useState(settings.maxPremiseCapacity);

  const [requirePhoto, setRequirePhoto] = useState(settings.requirePhotoCapture);
  const [requireId, setRequireId] = useState(settings.requireGovernmentId);
  const [requireBriefing, setRequireBriefing] = useState(settings.requireSafetyBriefing);
  const [requireVehInspection, setRequireVehInspection] = useState(settings.requireVehicleInspection);

  // Gates management
  const [gates, setGates] = useState(settings.gates);
  const [newGateName, setNewGateName] = useState('');
  const [newGateType, setNewGateType] = useState<'PEDESTRIAN' | 'VEHICULAR' | 'COMBINED'>('COMBINED');

  // Departments management
  const [departments, setDepartments] = useState(settings.companyDepartments);
  const [newDeptName, setNewDeptName] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      organizationName: orgName.trim() || 'SECUREGATE',
      organizationShortName: orgShortName.trim() || 'SECUREGATE',
      facilityName,
      facilityAddress,
      securityOfficePhone,
      emergencyHotline,
      visitorBadgePrefix: badgePrefix,
      defaultVisitorDurationHours: Number(defaultDuration),
      maxPremiseCapacity: Number(maxCapacity),
      requirePhotoCapture: requirePhoto,
      requireGovernmentId: requireId,
      requireSafetyBriefing: requireBriefing,
      requireVehicleInspection: requireVehInspection,
      gates,
      companyDepartments: departments,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddGate = () => {
    if (!newGateName.trim()) return;
    const newGate = {
      id: `gate-${Date.now()}`,
      name: newGateName.trim(),
      type: newGateType,
      active: true,
    };
    setGates([...gates, newGate]);
    setNewGateName('');
  };

  const handleRemoveGate = (id: string) => {
    if (gates.length <= 1) {
      alert('At least one security gate must remain configured.');
      return;
    }
    setGates(gates.filter((g) => g.id !== id));
  };

  const handleAddDept = () => {
    if (!newDeptName.trim() || departments.includes(newDeptName.trim())) return;
    setDepartments([...departments, newDeptName.trim()]);
    setNewDeptName('');
  };

  const handleRemoveDept = (dept: string) => {
    setDepartments(departments.filter((d) => d !== dept));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          alert('Database restored successfully from JSON backup.');
        } else {
          alert('Failed to parse valid backup JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Configurable Organizational System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize facility checkpoints, gate credentials, safety policies, and data management
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Facility Profile */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            1. Facility & Organization Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Organization Full Name *
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. SECUREGATE or Company Name"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Organization Short Name / Acronym *
              </label>
              <input
                type="text"
                required
                value={orgShortName}
                onChange={(e) => setOrgShortName(e.target.value)}
                placeholder="e.g. SECUREGATE"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Facility / Campus Name *
              </label>
              <input
                type="text"
                required
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Facility Complex Physical Address
              </label>
              <input
                type="text"
                value={facilityAddress}
                onChange={(e) => setFacilityAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Security Desk Phone
              </label>
              <input
                type="text"
                value={securityOfficePhone}
                onChange={(e) => setSecurityOfficePhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Emergency Response Hotline
              </label>
              <input
                type="text"
                value={emergencyHotline}
                onChange={(e) => setEmergencyHotline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Checkpoint Gates Management */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              2. Security Gates & Checkpoints ({gates.length})
            </h2>
            <span className="text-xs text-slate-400">Terminals active at entry posts</span>
          </div>

          <div className="space-y-2">
            {gates.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{g.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Type: {g.type} · ID: {g.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGate(g.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Gate row */}
          <div className="flex gap-2 pt-1 text-xs">
            <input
              type="text"
              value={newGateName}
              onChange={(e) => setNewGateName(e.target.value)}
              placeholder="New gate name (e.g. Gate 4 - South Logistics)"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
            <select
              value={newGateType}
              onChange={(e) => setNewGateType(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
            >
              <option value="COMBINED">Combined (Pedestrian + Vehicle)</option>
              <option value="VEHICULAR">Vehicular Only</option>
              <option value="PEDESTRIAN">Pedestrian Only</option>
            </select>
            <button
              type="button"
              onClick={handleAddGate}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gate</span>
            </button>
          </div>
        </div>

        {/* Section 3: Security & Visitor Rules Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            3. Operational Rules & Overstay Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Visitor Badge Prefix
              </label>
              <input
                type="text"
                value={badgePrefix}
                onChange={(e) => setBadgePrefix(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. VIS-2026-XXXX</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Default Visit Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(parseFloat(e.target.value) || 3)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Overstay alert triggers after this</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Premise Max Capacity (Souls)
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 80)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Occupancy gauge ceiling</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <input
                type="checkbox"
                checked={requirePhoto}
                onChange={(e) => setRequirePhoto(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-emerald-500"
              />
              <span>Enforce Photo Capture on Visitor Badges</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <input
                type="checkbox"
                checked={requireId}
                onChange={(e) => setRequireId(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-emerald-500"
              />
              <span>Require Government Issued ID Document</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <input
                type="checkbox"
                checked={requireBriefing}
                onChange={(e) => setRequireBriefing(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-emerald-500"
              />
              <span>Mandatory Safety Induction Checkbox</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <input
                type="checkbox"
                checked={requireVehInspection}
                onChange={(e) => setRequireVehInspection(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-emerald-500"
              />
              <span>Mandatory Pre-Trip Vehicle Checklist</span>
            </label>
          </div>
        </div>

        {/* Section 4: Departments List */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            4. Host Departments List
          </h2>

          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <span
                key={d}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-2"
              >
                <span>{d}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDept(d)}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-1 text-xs max-w-md">
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Add department (e.g. Research & Development)"
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddDept}
              className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                System settings updated successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Organization Settings</span>
          </button>
        </div>
      </form>

      {/* Section 5: Data Management & Integrity (Requirement 10) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Database className="w-4 h-4 text-emerald-400" />
          5. Database Security, Backup & Integrity (LocalStorage Persistent Storage)
        </h2>

        <p className="text-xs text-slate-400">
          Ensure business continuity and information availability by creating cold JSON backups or restoring operational states.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Export */}
          <button
            type="button"
            onClick={exportBackupJson}
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Download Backup</p>
              <p className="text-[10px] text-slate-400">Export complete JSON database</p>
            </div>
          </button>

          {/* Import */}
          <label className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors flex items-center gap-3 cursor-pointer">
            <Upload className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Restore Backup</p>
              <p className="text-[10px] text-slate-400">Upload JSON state dump</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset entire system database to initial demo state? All current passes and changes will be replaced with clean seed data.')) {
                resetAllData();
              }
            }}
            className="p-3.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/60 text-left transition-colors flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-200 text-xs">Factory Demo Reset</p>
              <p className="text-[10px] text-rose-300/80">Reload pristine demo state</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
