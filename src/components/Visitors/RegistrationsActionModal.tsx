import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Search, 
  ArrowRight, 
  Check, 
  Building2, 
  Phone, 
  Car, 
  CreditCard, 
  UserCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass, VisitorProfile, VisitPurpose, IdType } from '../../types/visitor';

interface RegistrationsActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pass: VisitorPass) => void;
}

export const RegistrationsActionModal: React.FC<RegistrationsActionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { 
    visitorProfiles, 
    searchVisitors, 
    registerAndCheckInVisitor, 
    checkInReturningVisitor, 
    settings,
    activeGate 
  } = useSecurity();

  const [activeMode, setActiveMode] = useState<'NEW' | 'RETURNING'>('RETURNING');

  // Returning search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<VisitorProfile | null>(null);

  // Form states for New / Check-in
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<IdType>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [company, setCompany] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostDepartment, setHostDepartment] = useState(settings.companyDepartments[0] || 'Operations & Logistics');
  const [purpose, setPurpose] = useState<VisitPurpose>('Business Meeting');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [assets, setAssets] = useState<Array<{ item: string; serialNumber: string }>>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const searchResults = searchQuery.trim() ? searchVisitors(searchQuery) : visitorProfiles;

  const handleSelectReturning = (profile: VisitorProfile) => {
    setSelectedProfile(profile);
    setFullName(profile.fullName);
    setIdType(profile.idType);
    setIdNumber(profile.idNumber);
    setPhoneNumber(profile.phoneNumber);
    setCompany(profile.company);
    if (profile.defaultVehiclePlate) setVehiclePlate(profile.defaultVehiclePlate);
  };

  const handleAddAsset = () => {
    if (!newItemName.trim()) return;
    setAssets([...assets, { item: newItemName.trim(), serialNumber: '' }]);
    setNewItemName('');
  };

  const handleRemoveAsset = (idx: number) => {
    setAssets(assets.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !idNumber.trim() || !hostName.trim()) {
      alert('Please fill in Guest Name, ID Number, and Host Name.');
      return;
    }

    try {
      setIsSubmitting(true);
      let pass: VisitorPass;

      if (selectedProfile) {
        pass = await checkInReturningVisitor({
          profileId: selectedProfile.id,
          hostName: hostName.trim(),
          hostDepartment,
          purpose,
          expectedDurationHours: 4,
          assetsCarried: assets,
          vehiclePlate: vehiclePlate.trim() || undefined,
          escortRequired: false,
          safetyInductionCompleted: true,
          ndaAccepted: true,
        });
      } else {
        pass = await registerAndCheckInVisitor({
          fullName: fullName.trim(),
          idType,
          idNumber: idNumber.trim(),
          phoneNumber: phoneNumber.trim() || 'N/A',
          company: company.trim() || 'Visitor',
          hostName: hostName.trim(),
          hostDepartment,
          purpose,
          expectedDurationHours: 4,
          assetsCarried: assets,
          vehiclePlate: vehiclePlate.trim() || undefined,
          escortRequired: false,
          safetyInductionCompleted: true,
          ndaAccepted: true,
        });
      }

      setIsSubmitting(false);
      onSuccess(pass);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err?.message || 'Error checking in guest.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto safe-pt safe-pb">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-sky-100 flex flex-col max-h-[94dvh] sm:max-h-[90vh] overflow-hidden my-auto text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-xl shadow-sm">
              📝
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrations & Logins
              </h2>
              <p className="text-xs text-slate-500">
                Digital Entrance Registry · Replaces Paper Book
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveMode('RETURNING');
              setSelectedProfile(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'RETURNING'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Returning Guest Lookup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('NEW');
              setSelectedProfile(null);
              setFullName('');
              setIdNumber('');
              setPhoneNumber('');
              setCompany('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'NEW'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Guest Registration</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeMode === 'RETURNING' && !selectedProfile && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type ID number, phone, or name to find guest..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectReturning(profile)}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/40 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{profile.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {profile.company} · {profile.idType}: {profile.idNumber}
                      </p>
                      <p className="text-[10px] text-sky-600 font-medium mt-0.5">
                        {profile.totalVisits} previous visits
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 font-bold text-[11px] transition-colors"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveMode('NEW')}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                >
                  Guest not in system? Register as New Guest →
                </button>
              </div>
            </div>
          )}

          {(activeMode === 'NEW' || selectedProfile) && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {selectedProfile && (
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="font-bold text-sky-900 text-xs">
                        {selectedProfile.fullName} ({selectedProfile.totalVisits} Prior Visits)
                      </p>
                      <p className="text-[10px] text-sky-700">
                        Details verified from guest records
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(null)}
                    className="text-[11px] text-sky-700 hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Guest Personal details */}
              <div className="space-y-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Kamau"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ID Document Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. ID-492019"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 0712 345 678"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Safaricom Ltd"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Vehicle Plate (if driving)
                    </label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      placeholder="e.g. KDA 124B"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Host Person / Office Visited *
                    </label>
                    <input
                      type="text"
                      required
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="e.g. Eng. Ndolo / HR"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Purpose of Visit
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as VisitPurpose)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-sky-500 focus:outline-none"
                    >
                      <option value="Business Meeting">Business Meeting</option>
                      <option value="Delivery & Logistics">Delivery & Logistics</option>
                      <option value="Technical Contractor">Technical Contractor</option>
                      <option value="Facility Maintenance">Facility Maintenance</option>
                      <option value="Job Interview">Job Interview</option>
                      <option value="Personal Visit">Personal Visit</option>
                    </select>
                  </div>
                </div>

                {/* Carried items logger (replaces manual property register) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Equipment / Property Carried In (Laptops, Tools)
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. HP Laptop / Tool Bag"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddAsset}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {assets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {assets.map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] flex items-center gap-1 font-medium"
                        >
                          {a.item}
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(i)}
                            className="text-sky-400 hover:text-rose-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Post: {activeGate.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Complete Check In & Issue Pass</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
