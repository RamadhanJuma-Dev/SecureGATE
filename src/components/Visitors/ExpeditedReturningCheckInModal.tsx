import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Building2, 
  CreditCard, 
  Car, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorProfile, VisitPurpose, VisitorPass } from '../../types/visitor';

interface ExpeditedReturningCheckInModalProps {
  profile: VisitorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pass: VisitorPass) => void;
}

export const ExpeditedReturningCheckInModal: React.FC<ExpeditedReturningCheckInModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { settings, checkInReturningVisitor, activeGate } = useSecurity();

  const [hostName, setHostName] = useState('');
  const [hostDepartment, setHostDepartment] = useState(settings.companyDepartments[0] || 'Operations & Logistics');
  const [purpose, setPurpose] = useState<VisitPurpose>('Business Meeting');
  const [expectedDurationHours, setExpectedDurationHours] = useState(settings.defaultVisitorDurationHours || 3);
  const [vehiclePlate, setVehiclePlate] = useState(profile?.defaultVehiclePlate || '');
  const [parkingBay, setParkingBay] = useState('');
  const [escortRequired, setEscortRequired] = useState(false);
  const [safetyInductionCompleted, setSafetyInductionCompleted] = useState(true);
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carried assets
  const [assets, setAssets] = useState<Array<{ item: string; serialNumber: string }>>([]);
  const [newAssetItem, setNewAssetItem] = useState('');
  const [newAssetSerial, setNewAssetSerial] = useState('');

  if (!isOpen || !profile) return null;

  const handleAddAsset = () => {
    if (!newAssetItem.trim()) return;
    setAssets([...assets, { item: newAssetItem.trim(), serialNumber: newAssetSerial.trim() }]);
    setNewAssetItem('');
    setNewAssetSerial('');
  };

  const handleRemoveAsset = (idx: number) => {
    setAssets(assets.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      alert('Please specify the host person / staff member being visited.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPass = await checkInReturningVisitor({
        profileId: profile.id,
        hostName: hostName.trim(),
        hostDepartment,
        purpose,
        expectedDurationHours: Number(expectedDurationHours),
        assetsCarried: assets,
        vehiclePlate: vehiclePlate.trim() || undefined,
        parkingBay: parkingBay.trim() || undefined,
        escortRequired,
        safetyInductionCompleted,
        ndaAccepted,
      });

      setIsSubmitting(false);
      onSuccess(newPass);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err?.message || 'Error checking in returning visitor.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Fast Returning Visitor Check-In
              </h2>
              <p className="text-xs text-slate-400">
                Personal identity verified from profile #{profile.idNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Verified Profile Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-lg object-cover border border-slate-600"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                  {profile.fullName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  {profile.fullName}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    VERIFIED ({profile.totalVisits} Prior Visits)
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {profile.company} · {profile.idType}: <span className="font-mono text-slate-300">{profile.idNumber}</span>
                </p>
              </div>
            </div>
          </div>

          {profile.isWatchlisted && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 flex items-start gap-2.5 text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">SECURITY WATCHLIST WARNING</p>
                <p className="mt-0.5 text-rose-300">{profile.watchlistReason}</p>
              </div>
            </div>
          )}

          {/* Visit Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Host to Visit *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Eng. Sarah Mitchell"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Host Department *
              </label>
              <select
                value={hostDepartment}
                onChange={(e) => setHostDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {settings.companyDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Purpose of Visit *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as VisitPurpose)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Business Meeting">Business Meeting</option>
                <option value="Delivery & Logistics">Delivery & Logistics</option>
                <option value="Technical Contractor">Technical Contractor</option>
                <option value="Facility Maintenance">Facility Maintenance</option>
                <option value="Job Interview">Job Interview</option>
                <option value="VIP Delegation">VIP Delegation</option>
                <option value="Audit & Inspection">Audit & Inspection</option>
                <option value="Personal Visit">Personal Visit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expected Duration (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={expectedDurationHours}
                onChange={(e) => setExpectedDurationHours(parseFloat(e.target.value) || 3)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Visitor Vehicle Plate (if driving)
              </label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. KCF 104M"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assigned Parking Bay
              </label>
              <input
                type="text"
                value={parkingBay}
                onChange={(e) => setParkingBay(e.target.value)}
                placeholder="e.g. Visitor P-08, Loading Bay 2"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Carried Items / Assets to Log */}
          <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Equipment / Assets Carried into Facility
              </span>
              <span className="text-[11px] text-slate-400">
                Laptops, tool sets, testing rigs
              </span>
            </div>

            {/* List */}
            {assets.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {assets.map((ast, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200"
                  >
                    <span>
                      {ast.item} {ast.serialNumber ? `(S/N: ${ast.serialNumber})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAsset(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newAssetItem}
                onChange={(e) => setNewAssetItem(e.target.value)}
                placeholder="Item name (e.g. Dell Latitude 5430)"
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500"
              />
              <input
                type="text"
                value={newAssetSerial}
                onChange={(e) => setNewAssetSerial(e.target.value)}
                placeholder="Serial No. (Optional)"
                className="w-36 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddAsset}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={escortRequired}
                onChange={(e) => setEscortRequired(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0"
              />
              <span>Continuous Host Escort Required</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safetyInductionCompleted}
                onChange={(e) => setSafetyInductionCompleted(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0"
              />
              <span>Safety & Evacuation Briefing Verified</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-mono">
              Terminal: {activeGate.name}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Issue Gate Pass & Check In</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
