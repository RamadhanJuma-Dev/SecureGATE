import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Search, 
  Clock, 
  Car, 
  Gauge, 
  ArrowRight,
  MapPin,
  User
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VehicleTrip } from '../../types/vehicle';

interface VehicleCheckInsActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTripForReturn: (trip: VehicleTrip) => void;
}

export const VehicleCheckInsActionModal: React.FC<VehicleCheckInsActionModalProps> = ({
  isOpen,
  onClose,
  onSelectTripForReturn,
}) => {
  const { trips, activeGate } = useSecurity();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');

  const filtered = activeTrips.filter((trip) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      trip.tripPassNumber.toLowerCase().includes(q) ||
      trip.fleetNumber.toLowerCase().includes(q) ||
      trip.plateNumber.toLowerCase().includes(q) ||
      trip.driverName.toLowerCase().includes(q) ||
      trip.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto safe-pt safe-pb">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-sky-100 flex flex-col max-h-[94dvh] sm:max-h-[90vh] overflow-hidden my-auto text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl shadow-sm">
              🚗
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Vehicle Check Ins
              </h2>
              <p className="text-xs text-slate-500">
                Return Checked-Out Organizational Vehicles
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

        {/* Search */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vehicle ID, license plate, driver..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:border-rose-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1">
            <span>{filtered.length} organizational vehicles currently deployed</span>
            <span>Terminal: {activeGate.name}</span>
          </div>
        </div>

        {/* Vehicle Trips List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">All fleet vehicles are checked in on the yard</p>
              <p className="text-slate-400 mt-0.5">No vehicles are currently out on active trips.</p>
            </div>
          ) : (
            filtered.map((trip) => {
              const departureTimeStr = new Date(trip.departureTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={trip.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{trip.fleetNumber}</span>
                        <span className="font-mono text-[10px] text-emerald-700 font-bold px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">
                          {trip.plateNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">· {trip.makeModel}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Driver: <strong>{trip.driverName}</strong> ({trip.department})
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Dest: {trip.destination}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTripForReturn(trip);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Check In</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-100">
                    <span>Departed: {departureTimeStr}</span>
                    <span>Start Odo: {trip.departureOdometer.toLocaleString()} km</span>
                    <span className="text-amber-600 font-bold">Fuel: {trip.departureFuelPercent}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Records return mileage and completes condition walkaround.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
