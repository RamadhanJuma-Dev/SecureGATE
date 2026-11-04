import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Gauge, 
  Fuel, 
  ClipboardCheck, 
  AlertTriangle, 
  FileText, 
  Truck,
  Key
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VehicleTrip, PostTripChecklist } from '../../types/vehicle';

interface VehicleReturnModalProps {
  trip: VehicleTrip | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VehicleReturnModal: React.FC<VehicleReturnModalProps> = ({
  trip,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { returnVehicle, activeGate } = useSecurity();

  if (!isOpen || !trip) return null;

  const [returnOdometer, setReturnOdometer] = useState<number>(trip.departureOdometer + 45);
  const [returnFuelPercent, setReturnFuelPercent] = useState<number>(Math.max(20, trip.departureFuelPercent - 15));
  const [incidentOccurred, setIncidentOccurred] = useState(false);
  const [incidentNotes, setIncidentNotes] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  const [checklist, setChecklist] = useState<PostTripChecklist>({
    exteriorDamageFree: true,
    interiorClean: true,
    keysReturned: true,
    logbookSigned: true,
    fuelReplacedOrReported: true,
    incidentOccurred: false,
  });

  const distanceTraveled = Math.max(0, returnOdometer - trip.departureOdometer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnOdometer < trip.departureOdometer) {
      alert('Return odometer cannot be less than departure odometer reading.');
      return;
    }

    returnVehicle({
      tripId: trip.id,
      returnOdometer: Number(returnOdometer),
      returnFuelPercent: Number(returnFuelPercent),
      returnChecklist: {
        ...checklist,
        incidentOccurred,
        incidentNotes: incidentOccurred ? incidentNotes : undefined,
      },
      returnNotes: returnNotes.trim() || undefined,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Vehicle Check-In & Post-Trip Inspection
              </h2>
              <p className="text-xs text-slate-400">
                Log return mileage, fuel reconciliation, and physical vehicle return inspection
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
          {/* Trip Summary Card */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  TRIP PASS #{trip.tripPassNumber}
                </span>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  {trip.fleetNumber} ({trip.plateNumber})
                  <span className="text-xs font-normal text-slate-300">· {trip.makeModel}</span>
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                ON RETURN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-300">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">DRIVER</span>
                <span className="font-semibold text-white">{trip.driverName}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">DESTINATION</span>
                <span className="font-semibold text-white truncate block">{trip.destination}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">START ODOMETER</span>
                <span className="font-semibold text-white">{trip.departureOdometer.toLocaleString()} km</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">START FUEL</span>
                <span className="font-semibold text-amber-400">{trip.departureFuelPercent}%</span>
              </div>
            </div>
          </div>

          {/* Return Odometer & Fuel */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              1. Return Odometer & Trip Distance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Return Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  required
                  min={trip.departureOdometer}
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(parseInt(e.target.value) || trip.departureOdometer)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Calculated Trip Distance
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs">
                  {distanceTraveled.toLocaleString()} km traveled
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Return Fuel Level ({returnFuelPercent}%)
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={returnFuelPercent}
                    onChange={(e) => setReturnFuelPercent(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-amber-400 font-bold w-10 text-right">
                    {returnFuelPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Post-Trip Walkaround Inspection Checklist */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                Return Condition Inspection Checklist
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Post-Trip Verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.exteriorDamageFree}
                  onChange={(e) => setChecklist({ ...checklist, exteriorDamageFree: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Exterior body inspected (no new damage/dents)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.interiorClean}
                  onChange={(e) => setChecklist({ ...checklist, interiorClean: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Vehicle cabin clean & free of debris</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.keysReturned}
                  onChange={(e) => setChecklist({ ...checklist, keysReturned: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Ignition keys surrendered to security key safe</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.logbookSigned}
                  onChange={(e) => setChecklist({ ...checklist, logbookSigned: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Physical logbook entries counter-signed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={checklist.fuelReplacedOrReported}
                  onChange={(e) => setChecklist({ ...checklist, fuelReplacedOrReported: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span>Fuel replenished or refueling voucher filed</span>
              </label>
            </div>

            {/* Incident / Damage Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-300 font-medium">
                <input
                  type="checkbox"
                  checked={incidentOccurred}
                  onChange={(e) => setIncidentOccurred(e.target.checked)}
                  className="rounded border-rose-700 bg-slate-800 text-rose-500"
                />
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Incident, Scratches or Mechanical Fault Occurred During Trip
                </span>
              </label>

              {incidentOccurred && (
                <div className="mt-2.5 p-3 rounded-lg bg-rose-950/40 border border-rose-800/70 space-y-1.5">
                  <span className="text-[11px] font-semibold text-rose-300 block">
                    Defect / Incident Report Details *
                  </span>
                  <textarea
                    rows={2}
                    required
                    value={incidentNotes}
                    onChange={(e) => setIncidentNotes(e.target.value)}
                    placeholder="Describe incident location, damage to bumper/panel, tire puncture, or warning light..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-rose-800/80 text-white text-xs placeholder-slate-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-rose-400">
                    * Flagging an incident will automatically mark the vehicle for Maintenance Inspection.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              General Gate Officer Remarks (Optional)
            </label>
            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Parked in Fleet Yard Bay 4. Trip completed on schedule."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Return Gate: {activeGate.name}
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
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Check-In & Release Vehicle</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
