import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  User, 
  MapPin, 
  Gauge, 
  Fuel, 
  ClipboardCheck, 
  AlertTriangle,
  Check,
  CheckSquare
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { OrgVehicle, PreTripChecklist, VehicleTrip } from '../../types/vehicle';

interface VehicleDispatchModalProps {
  vehicle: OrgVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trip: VehicleTrip) => void;
}

export const VehicleDispatchModal: React.FC<VehicleDispatchModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { vehicles, dispatchVehicle, settings, activeGate } = useSecurity();

  // Selected vehicle (or passed via prop)
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicle?.id || '');

  // Form inputs
  const [driverName, setDriverName] = useState(vehicle?.assignedDriver || '');
  const [driverEmployeeId, setDriverEmployeeId] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [passengersList, setPassengersList] = useState('');
  const [department, setDepartment] = useState(vehicle?.assignedDepartment || settings.companyDepartments[0]);
  const [expectedDurationHours, setExpectedDurationHours] = useState(4);

  const activeVeh = vehicles.find((v) => v.id === (selectedVehicleId || vehicle?.id)) || vehicle;

  const [departureOdometer, setDepartureOdometer] = useState<number>(activeVeh?.currentOdometer || 0);
  const [departureFuelPercent, setDepartureFuelPercent] = useState<number>(activeVeh?.fuelLevelPercent || 80);

  // Pre-trip walkaround checklist
  const [checklist, setChecklist] = useState<PreTripChecklist>({
    lightsOk: true,
    tiresConditionOk: true,
    bodyScratchesChecked: true,
    interiorClean: true,
    spareWheelToolsPresent: true,
    safetyTrianglesFireExtinguisher: true,
    fuelConfirmed: true,
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const found = vehicles.find((v) => v.id === id);
    if (found) {
      setDepartureOdometer(found.currentOdometer);
      setDepartureFuelPercent(found.fuelLevelPercent);
      if (found.assignedDriver) setDriverName(found.assignedDriver);
      setDepartment(found.assignedDepartment);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVeh) {
      alert('Please select an available vehicle.');
      return;
    }
    if (!driverName.trim() || !driverEmployeeId.trim() || !destination.trim() || !purpose.trim()) {
      alert('Please fill in all mandatory driver and destination fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const trip = await dispatchVehicle({
        vehicleId: activeVeh.id,
        driverName: driverName.trim(),
        driverEmployeeId: driverEmployeeId.trim(),
        driverLicenseNumber: driverLicenseNumber.trim() || 'N/A',
        driverPhone: driverPhone.trim(),
        destination: destination.trim(),
        purpose: purpose.trim(),
        passengersList: passengersList.trim() || `${driverName} (Solo)`,
        department,
        expectedDurationHours: Number(expectedDurationHours),
        departureOdometer: Number(departureOdometer),
        departureFuelPercent: Number(departureFuelPercent),
        departureChecklist: checklist,
      });

      setIsSubmitting(false);
      onSuccess(trip);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err?.message || 'Error checking out vehicle.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Organizational Vehicle Check-Out & Dispatch
              </h2>
              <p className="text-xs text-slate-400">
                Log authorized driver, destination route, mileage, and pre-trip inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Vehicle Selection */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Select Available Fleet Vehicle *
            </label>
            <select
              value={activeVeh?.id || ''}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            >
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fleetNumber} - {v.plateNumber} ({v.makeModel}) · {v.assignedDepartment} · {v.currentOdometer.toLocaleString()} km
                </option>
              ))}
            </select>

            {activeVeh && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-300 font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">FLEET ID</span>
                  <span className="font-bold text-white">{activeVeh.fleetNumber}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">LICENSE PLATE</span>
                  <span className="font-bold text-emerald-400">{activeVeh.plateNumber}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">ODOMETER (KM)</span>
                  <span className="font-bold text-white">{activeVeh.currentOdometer.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">FUEL LEVEL</span>
                  <span className="font-bold text-amber-400">{activeVeh.fuelLevelPercent}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Driver Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              1. Authorized Driver Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Peter Mwangi"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee ID No. *
                </label>
                <input
                  type="text"
                  required
                  value={driverEmployeeId}
                  onChange={(e) => setDriverEmployeeId(e.target.value.toUpperCase())}
                  placeholder="e.g. EMP-OPS-402"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Driver License No.
                </label>
                <input
                  type="text"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  placeholder="e.g. DL-889104"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Driver Mobile Contact
                </label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 782-9901"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Budget Center *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {settings.companyDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Destination & Trip Purpose */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              2. Destination & Mission Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination / Route *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Western Distribution Hub & Harbor Terminal"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purpose of Trip *
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Scheduled raw material pickup & customs verification"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Passengers / Escort Staff Roster
                </label>
                <input
                  type="text"
                  value={passengersList}
                  onChange={(e) => setPassengersList(e.target.value)}
                  placeholder="e.g. Driver, Samuel Otieno (Tech), Alice Ward"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authorized Trip Duration (Hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="72"
                  step="0.5"
                  value={expectedDurationHours}
                  onChange={(e) => setExpectedDurationHours(parseFloat(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Mileage & Fuel Capture */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              3. Departure Odometer & Fuel Check
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Departure Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={departureOdometer}
                  onChange={(e) => setDepartureOdometer(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Departure Fuel Level ({departureFuelPercent}%)
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={departureFuelPercent}
                    onChange={(e) => setDepartureFuelPercent(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-semibold text-amber-400 w-12 text-right">
                    {departureFuelPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Trip Walkaround Inspection Checklist */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                Physical Vehicle Walkaround & Safety Inspection
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Mandatory Security Check
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.lightsOk}
                  onChange={(e) => setChecklist({ ...checklist, lightsOk: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Headlights, brakelights, blinkers functional</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.tiresConditionOk}
                  onChange={(e) => setChecklist({ ...checklist, tiresConditionOk: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Tires inflated & tread condition inspected</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.bodyScratchesChecked}
                  onChange={(e) => setChecklist({ ...checklist, bodyScratchesChecked: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Exterior body inspected (no unreported dents)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.spareWheelToolsPresent}
                  onChange={(e) => setChecklist({ ...checklist, spareWheelToolsPresent: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Spare wheel, jack & tools present</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.safetyTrianglesFireExtinguisher}
                  onChange={(e) => setChecklist({ ...checklist, safetyTrianglesFireExtinguisher: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Fire extinguisher & safety warning triangles</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.interiorClean}
                  onChange={(e) => setChecklist({ ...checklist, interiorClean: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Cabin clean & official logbook in glove box</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Clearance Post: {activeGate.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !activeVeh}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Issue Gate Clearance & Dispatch</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
