import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Building2, 
  CreditCard, 
  Phone, 
  Mail, 
  Camera, 
  Car, 
  Plus, 
  Trash2, 
  AlertCircle,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { IdType, VisitPurpose, VisitorPass, VisitorProfile } from '../../types/visitor';

interface VisitorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pass: VisitorPass) => void;
  onSelectExistingProfile?: (profile: VisitorProfile) => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export const VisitorRegisterModal: React.FC<VisitorRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSelectExistingProfile,
}) => {
  const { settings, registerAndCheckInVisitor, visitorProfiles } = useSecurity();

  // Form states
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<IdType>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_AVATARS[0]);
  
  const [hostName, setHostName] = useState('');
  const [hostDepartment, setHostDepartment] = useState(settings.companyDepartments[0] || 'Engineering & Tech');
  const [purpose, setPurpose] = useState<VisitPurpose>('Business Meeting');
  const [expectedDurationHours, setExpectedDurationHours] = useState(settings.defaultVisitorDurationHours || 3);
  
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [parkingBay, setParkingBay] = useState('');
  
  const [escortRequired, setEscortRequired] = useState(false);
  const [safetyInductionCompleted, setSafetyInductionCompleted] = useState(true);
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [notes, setNotes] = useState('');

  // Assets
  const [assets, setAssets] = useState<Array<{ item: string; serialNumber: string }>>([]);
  const [itemInput, setItemInput] = useState('');
  const [serialInput, setSerialInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time check if ID already exists in system
  const existingProfileMatch = idNumber.trim()
    ? visitorProfiles.find(
        (p) => p.idNumber.toLowerCase() === idNumber.trim().toLowerCase()
      )
    : null;

  const handleAddAsset = () => {
    if (!itemInput.trim()) return;
    setAssets([...assets, { item: itemInput.trim(), serialNumber: serialInput.trim() }]);
    setItemInput('');
    setSerialInput('');
  };

  const handleRemoveAsset = (index: number) => {
    setAssets(assets.filter((_, idx) => idx !== index));
  };

  const handleAutoFillFromMatch = (profile: VisitorProfile) => {
    setFullName(profile.fullName);
    setIdType(profile.idType);
    setIdNumber(profile.idNumber);
    setPhoneNumber(profile.phoneNumber);
    setEmail(profile.email || '');
    setCompany(profile.company);
    if (profile.photoUrl) setPhotoUrl(profile.photoUrl);
    if (profile.defaultVehiclePlate) setVehiclePlate(profile.defaultVehiclePlate);
  };

  const resetForm = () => {
    setFullName('');
    setIdType('National ID');
    setIdNumber('');
    setPhoneNumber('');
    setEmail('');
    setCompany('');
    setPhotoUrl(SAMPLE_AVATARS[0]);
    setHostName('');
    setHostDepartment(settings.companyDepartments[0] || 'Engineering & Tech');
    setPurpose('Business Meeting');
    setExpectedDurationHours(settings.defaultVisitorDurationHours || 3);
    setVehiclePlate('');
    setParkingBay('');
    setEscortRequired(false);
    setSafetyInductionCompleted(true);
    setNdaAccepted(true);
    setNotes('');
    setAssets([]);
    setItemInput('');
    setSerialInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !idNumber.trim() || !phoneNumber.trim() || !company.trim() || !hostName.trim()) {
      alert('Please fill in all mandatory identity and host fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newPass = await registerAndCheckInVisitor({
        fullName: fullName.trim(),
        idType,
        idNumber: idNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        company: company.trim(),
        photoUrl,
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
        notes: notes.trim() || undefined,
      });

      resetForm();
      setIsSubmitting(false);
      onSuccess(newPass);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      const errMsg = err?.message || err?.error_description || 'Database error occurred while registering visitor.';
      alert(`Database Error: ${errMsg}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                New Visitor Registration & Check-In
              </h2>
              <p className="text-xs text-slate-400">
                Capture official identification, assign gate pass, and issue credentials
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

        {/* Existing Profile Detection Banner */}
        {existingProfileMatch && (
          <div className="px-6 py-3 bg-emerald-950/60 border-b border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Returning Record Found:</strong> {existingProfileMatch.fullName} ({existingProfileMatch.company}) has {existingProfileMatch.totalVisits} prior visits.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleAutoFillFromMatch(existingProfileMatch)}
              className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shrink-0"
            >
              Auto-Populate Details
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Visitor Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              1. Personal Identification & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name (as per Official ID) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID Document Type *
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as IdType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driver License</option>
                  <option value="Military ID">Military ID</option>
                  <option value="Corporate Badge">Corporate Badge</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID / Passport Number *
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ID-9824102"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +1 (555) 012-4920"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Siemens Healthcare"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Photo Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                Badge Photo Capture
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SAMPLE_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoUrl(url)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      photoUrl === url ? 'border-emerald-500 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Visit Destination & Purpose */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              2. Host & Purpose of Visit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Host Staff Member / Person Visited *
                </label>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Dr. Amanda Vance"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department *
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expected Duration (Hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={expectedDurationHours}
                  onChange={(e) => setExpectedDurationHours(parseFloat(e.target.value) || 3)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Equipment & Vehicle */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Car className="w-3.5 h-3.5 text-emerald-400" />
              3. Assets Carried & Vehicle
            </h3>

            {/* Asset items */}
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Equipment / Assets Carried into Facility
                </span>
                <span className="text-[11px] text-slate-500">
                  Recorded to verify on check-out
                </span>
              </div>

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
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  placeholder="Item name (e.g. MacBook Pro M3)"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500"
                />
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Visitor Vehicle License Plate (Optional)
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="e.g. KDA 992P"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Designated Parking Bay
                </label>
                <input
                  type="text"
                  value={parkingBay}
                  onChange={(e) => setParkingBay(e.target.value)}
                  placeholder="e.g. Bay V-04"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security Protocols */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={escortRequired}
                  onChange={(e) => setEscortRequired(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0"
                />
                <span>Mandatory Staff Escort Required</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyInductionCompleted}
                  onChange={(e) => setSafetyInductionCompleted(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-0"
                />
                <span>Safety Induction & Rules Acknowledged</span>
              </label>
            </div>
          </div>

          {/* Submit bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Visitor will be registered in the permanent identity database.
            </p>
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
                <span>Complete Registration & Check In</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
