import React, { useState } from 'react';
import { X, Building2, Shield, Check, Save } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

interface OrgConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrgConfigModal: React.FC<OrgConfigModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSecurity();

  const [orgName, setOrgName] = useState(settings.organizationName || 'SECUREGATE');
  const [orgShortName, setOrgShortName] = useState(settings.organizationShortName || 'SECUREGATE');
  const [facilityName, setFacilityName] = useState(settings.facilityName);
  const [visitorBadgePrefix, setVisitorBadgePrefix] = useState(settings.visitorBadgePrefix || 'VIS-');
  const [phone, setPhone] = useState(settings.securityOfficePhone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOrgName = orgName.trim() || 'SECUREGATE';
    const finalShortName = orgShortName.trim() || finalOrgName;

    updateSettings({
      organizationName: finalOrgName,
      organizationShortName: finalShortName,
      facilityName: facilityName.trim() || `${finalOrgName} Central Operations Hub`,
      visitorBadgePrefix: visitorBadgePrefix.trim() || 'VIS-',
      securityOfficePhone: phone.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in safe-pt safe-pb">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-sky-100 overflow-hidden text-slate-800 transition-all">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Organization Configuration
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Customize identity, name and terminal branding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Organization Full Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. SECUREGATE or Your Company Name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-sky-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used in headers, login screens, audit reports and visitor badges.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Organization Short Name / Acronym
            </label>
            <input
              type="text"
              required
              value={orgShortName}
              onChange={(e) => setOrgShortName(e.target.value)}
              placeholder="e.g. SECUREGATE"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-sky-500 transition-all font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Replaces contextual names (e.g. &quot;{orgShortName || 'SECUREGATE'} Vehicle Check Ins&quot;, &quot;{orgShortName || 'SECUREGATE'} Vehicles Out&quot;).
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
              placeholder="e.g. SECUREGATE Central Operations Hub"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-sky-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Visitor Badge Prefix
              </label>
              <input
                type="text"
                value={visitorBadgePrefix}
                onChange={(e) => setVisitorBadgePrefix(e.target.value)}
                placeholder="VIS-"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-semibold focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Security Desk Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-4820"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Organization settings updated successfully!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
