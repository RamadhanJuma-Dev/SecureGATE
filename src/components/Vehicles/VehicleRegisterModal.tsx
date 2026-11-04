import React, { useState } from 'react';
import { X, Truck, Plus, Check } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VehicleType, VehicleCondition } from '../../types/vehicle';

interface VehicleRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleRegisterModal: React.FC<VehicleRegisterModalProps> = ({ isOpen, onClose }) => {
  const { addVehicle, settings } = useSecurity();

  const [fleetNumber, setFleetNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState<VehicleType>('Pickup 4x4');
  const [assignedDepartment, setAssignedDepartment] = useState(settings.companyDepartments[0]);
  const [currentOdometer, setCurrentOdometer] = useState(15000);
  const [fuelLevelPercent, setFuelLevelPercent] = useState(100);
  const [condition, setCondition] = useState<VehicleCondition>('Excellent');
  const [assignedDriver, setAssignedDriver] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fleetNumber.trim() || !plateNumber.trim() || !makeModel.trim()) {
      alert('Please fill in Fleet ID, License Plate, and Make/Model.');
      return;
    }

    addVehicle({
      fleetNumber: fleetNumber.trim().toUpperCase(),
      plateNumber: plateNumber.trim().toUpperCase(),
      makeModel: makeModel.trim(),
      year: Number(year),
      type,
      assignedDepartment,
      currentOdometer: Number(currentOdometer),
      fuelLevelPercent: Number(fuelLevelPercent),
      lastInspectionDate: new Date().toISOString().split('T')[0],
      condition,
      assignedDriver: assignedDriver.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Register Organizational Vehicle</h2>
              <p className="text-xs text-slate-400">Add client or company-operated vehicle to fleet registry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Fleet Call ID *</label>
              <input
                type="text"
                required
                value={fleetNumber}
                onChange={(e) => setFleetNumber(e.target.value)}
                placeholder="e.g. FL-08 or VAN-05"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">License Plate *</label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. KDF 201R"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Make & Model *</label>
              <input
                type="text"
                required
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                placeholder="e.g. Toyota Hilux 2.8 D-4D"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Year</label>
              <input
                type="number"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Vehicle Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
              >
                <option value="Pickup 4x4">Pickup 4x4</option>
                <option value="Cargo Van">Cargo Van</option>
                <option value="Sedan">Sedan</option>
                <option value="Heavy Box Truck">Heavy Box Truck</option>
                <option value="Staff Shuttle / Bus">Staff Shuttle / Bus</option>
                <option value="Emergency Response">Emergency Response</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Assigned Department</label>
              <select
                value={assignedDepartment}
                onChange={(e) => setAssignedDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
              >
                {settings.companyDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Odometer (km)</label>
              <input
                type="number"
                min="0"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Fuel Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={fuelLevelPercent}
                onChange={(e) => setFuelLevelPercent(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as VehicleCondition)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Attention Required">Attention Required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Designated Driver (Optional)</label>
            <input
              type="text"
              value={assignedDriver}
              onChange={(e) => setAssignedDriver(e.target.value)}
              placeholder="e.g. John Ndung'u"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Vehicle to Fleet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
