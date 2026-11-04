import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  User, 
  Gauge, 
  Fuel,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VehicleTrip } from '../../types/vehicle';

interface VehicleTripLogViewProps {
  onOpenDispatch: () => void;
  onOpenReturn: (trip: VehicleTrip) => void;
}

export const VehicleTripLogView: React.FC<VehicleTripLogViewProps> = ({
  onOpenDispatch,
  onOpenReturn,
}) => {
  const { trips } = useSecurity();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED'>('ALL');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const filtered = trips.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.tripPassNumber.toLowerCase().includes(q) ||
        t.fleetNumber.toLowerCase().includes(q) ||
        t.plateNumber.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.driverEmployeeId.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeCount = trips.filter((t) => t.status === 'ACTIVE').length;
  const returnedCount = trips.filter((t) => t.status === 'RETURNED').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            Organizational Vehicle Movement & Trip Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical trip clearances, drivers, mileage consumption, and post-trip condition reports
          </p>
        </div>

        <button
          onClick={onOpenDispatch}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <span>+ Dispatch Vehicle</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Trips ({trips.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              statusFilter === 'ACTIVE'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Trips ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('RETURNED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              statusFilter === 'RETURNED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Returned ({returnedCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trip ID, driver, fleet ID, destination..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-medium">TRIP PASS & VEHICLE</th>
                <th className="py-3 px-4 font-medium">DRIVER & DEPT</th>
                <th className="py-3 px-4 font-medium">DESTINATION & PURPOSE</th>
                <th className="py-3 px-4 font-medium">DEPARTURE</th>
                <th className="py-3 px-4 font-medium">RETURN & DISTANCE</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No vehicle movement records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((trip) => {
                  const isActive = trip.status === 'ACTIVE';
                  const isReturned = trip.status === 'RETURNED';
                  const isExpanded = expandedTripId === trip.id;

                  return (
                    <React.Fragment key={trip.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        {/* Vehicle & Trip ID */}
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-emerald-400 text-[11px]">
                            {trip.tripPassNumber}
                          </p>
                          <p className="font-bold text-white text-xs mt-0.5">
                            {trip.fleetNumber} · <span className="font-mono text-slate-300">{trip.plateNumber}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">{trip.makeModel}</p>
                        </td>

                        {/* Driver */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{trip.driverName}</p>
                          <p className="font-mono text-[11px] text-slate-400">
                            {trip.driverEmployeeId}
                          </p>
                          <p className="text-[10px] text-slate-500">{trip.department}</p>
                        </td>

                        {/* Destination */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-medium text-slate-200 truncate">{trip.destination}</p>
                          <p className="text-[11px] text-slate-400 truncate">{trip.purpose}</p>
                          {trip.passengersList && (
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              Roster: {trip.passengersList}
                            </p>
                          )}
                        </td>

                        {/* Departure */}
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <p className="text-slate-200 font-semibold">
                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-slate-500 text-[10px]">
                            {new Date(trip.departureTime).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Odo: {trip.departureOdometer.toLocaleString()} km
                          </p>
                          <p className="text-[10px] text-amber-400">
                            Fuel: {trip.departureFuelPercent}%
                          </p>
                        </td>

                        {/* Return */}
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {isReturned && trip.actualReturnTime ? (
                            <>
                              <p className="text-emerald-400 font-semibold">
                                {new Date(trip.actualReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-slate-500 text-[10px]">
                                {new Date(trip.actualReturnTime).toLocaleDateString()}
                              </p>
                              <p className="text-[11px] text-white font-bold">
                                {trip.distanceTraveledKm} km driven
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-amber-400">
                                Exp: {new Date(trip.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-[10px] text-slate-500">Currently deployed</p>
                            </>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              isActive
                                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {isActive ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isActive ? 'ACTIVE ON TRIP' : 'RETURNED & SIGNED'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                            >
                              <span>Inspect</span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {isActive && (
                              <button
                                onClick={() => onOpenReturn(trip)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Check In</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Walkaround / Return Inspection Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Pre-Trip Checklist Details */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                                  Pre-Trip Inspection Verification (Departure)
                                </span>
                                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 pt-1">
                                  <span className={trip.departureChecklist.lightsOk ? 'text-emerald-400' : 'text-rose-400'}>
                                    ✓ Lights & Indicators: {trip.departureChecklist.lightsOk ? 'Passed' : 'Defect'}
                                  </span>
                                  <span className={trip.departureChecklist.tiresConditionOk ? 'text-emerald-400' : 'text-rose-400'}>
                                    ✓ Tires Condition: {trip.departureChecklist.tiresConditionOk ? 'Passed' : 'Defect'}
                                  </span>
                                  <span className={trip.departureChecklist.bodyScratchesChecked ? 'text-emerald-400' : 'text-rose-400'}>
                                    ✓ Body Scratches: {trip.departureChecklist.bodyScratchesChecked ? 'Verified' : 'Defect'}
                                  </span>
                                  <span className={trip.departureChecklist.spareWheelToolsPresent ? 'text-emerald-400' : 'text-rose-400'}>
                                    ✓ Spare & Tools: {trip.departureChecklist.spareWheelToolsPresent ? 'Present' : 'Missing'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono pt-1">
                                  Cleared by Officer: {trip.officerDepartureName} at {trip.departureGate}
                                </p>
                              </div>

                              {/* Post-Trip Checklist Details (if returned) */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  Post-Trip Return Inspection Checklist
                                </span>
                                {trip.returnChecklist ? (
                                  <div className="space-y-1.5 text-[11px]">
                                    <div className="grid grid-cols-2 gap-1 text-slate-300">
                                      <span className={trip.returnChecklist.exteriorDamageFree ? 'text-emerald-400' : 'text-rose-400'}>
                                        ✓ Damage Check: {trip.returnChecklist.exteriorDamageFree ? 'Clean' : 'Damage Noted'}
                                      </span>
                                      <span className={trip.returnChecklist.keysReturned ? 'text-emerald-400' : 'text-rose-400'}>
                                        ✓ Key Surrendered: {trip.returnChecklist.keysReturned ? 'Yes' : 'No'}
                                      </span>
                                      <span className={trip.returnChecklist.interiorClean ? 'text-emerald-400' : 'text-rose-400'}>
                                        ✓ Cabin Clean: {trip.returnChecklist.interiorClean ? 'Yes' : 'No'}
                                      </span>
                                      <span className={trip.returnChecklist.logbookSigned ? 'text-emerald-400' : 'text-rose-400'}>
                                        ✓ Logbook Signed: {trip.returnChecklist.logbookSigned ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                    {trip.returnChecklist.incidentOccurred && (
                                      <p className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px]">
                                        <strong>INCIDENT FLAGGED:</strong> {trip.returnChecklist.incidentNotes}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-slate-400 font-mono pt-1">
                                      Inspected by Officer: {trip.officerReturnName} at {trip.returnGate}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-slate-500 text-xs italic py-2">
                                    Vehicle still deployed on route. Awaiting return at checkpoint gate.
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
