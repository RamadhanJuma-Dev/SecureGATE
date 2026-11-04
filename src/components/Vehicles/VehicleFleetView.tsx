import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Fuel, 
  Gauge, 
  Building2, 
  Car,
  AlertTriangle
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { OrgVehicle, VehicleTrip } from '../../types/vehicle';

interface VehicleFleetViewProps {
  onOpenDispatch: (vehicle?: OrgVehicle) => void;
  onOpenReturn: (trip: VehicleTrip) => void;
  onOpenRegisterModal: () => void;
}

export const VehicleFleetView: React.FC<VehicleFleetViewProps> = ({
  onOpenDispatch,
  onOpenReturn,
  onOpenRegisterModal,
}) => {
  const { vehicles, trips } = useSecurity();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrgVehicle['status']>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Active trips mapped by vehicle ID
  const activeTripsByVehicle = trips.reduce<Record<string, VehicleTrip>>((acc, trip) => {
    if (trip.status === 'ACTIVE') {
      acc[trip.vehicleId] = trip;
    }
    return acc;
  }, {});

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (deptFilter !== 'ALL' && v.assignedDepartment !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        v.fleetNumber.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q) ||
        v.makeModel.toLowerCase().includes(q) ||
        v.assignedDepartment.toLowerCase().includes(q) ||
        (v.assignedDriver && v.assignedDriver.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const onTripCount = vehicles.filter((v) => v.status === 'ON_TRIP').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE' || v.status === 'GROUNDED').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            Organizational Vehicle Fleet Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fleet tracking, status monitoring, mileage ledger, and trip clearance management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDispatch()}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>+ Dispatch Fleet Vehicle</span>
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Fleet</span>
            <span className="text-xl font-bold font-mono text-white">{totalCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <Car className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-400 block">Available on Yard</span>
            <span className="text-xl font-bold font-mono text-white">{availableCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-amber-400 block">Out on Trip</span>
            <span className="text-xl font-bold font-mono text-white">{onTripCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-rose-400 block">Maintenance / Service</span>
            <span className="text-xl font-bold font-mono text-white">{maintenanceCount}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Available ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter('ON_TRIP')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'ON_TRIP'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              On Trip ({onTripCount})
            </button>
            <button
              onClick={() => setStatusFilter('MAINTENANCE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'MAINTENANCE'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Maintenance ({maintenanceCount})
            </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fleet ID, plate, model, driver..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            <Truck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No vehicles match filter</p>
          </div>
        ) : (
          filtered.map((veh) => {
            const isAvailable = veh.status === 'AVAILABLE';
            const isOnTrip = veh.status === 'ON_TRIP';
            const isMaintenance = veh.status === 'MAINTENANCE';
            const activeTrip = activeTripsByVehicle[veh.id];

            return (
              <div
                key={veh.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3.5 hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Top Bar: Fleet ID & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        {veh.fleetNumber}
                      </span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400">
                        {veh.plateNumber}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        isAvailable
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isOnTrip
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {veh.status === 'AVAILABLE' ? 'ON FLEET YARD' : veh.status === 'ON_TRIP' ? 'ON TRIP' : veh.status}
                    </span>
                  </div>

                  {/* Make Model & Department */}
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-slate-200">{veh.makeModel}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{veh.type}</span>
                      <span>·</span>
                      <span>{veh.assignedDepartment}</span>
                    </div>
                  </div>

                  {/* Active Mission Banner (if on trip) */}
                  {isOnTrip && activeTrip && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Driver: {activeTrip.driverName}
                        </span>
                        <span className="font-mono text-[10px] text-amber-400">{activeTrip.tripPassNumber}</span>
                      </div>
                      <p className="text-[11px] text-amber-300/80 truncate">
                        Dest: {activeTrip.destination}
                      </p>
                    </div>
                  )}

                  {/* Metrics: Odometer & Fuel Gauge */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[9px] uppercase text-slate-500 block">Odometer</span>
                      <span className="font-bold text-white">{veh.currentOdometer.toLocaleString()} km</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-[9px] uppercase text-slate-500">
                        <span>Fuel</span>
                        <span className="font-bold text-amber-400">{veh.fuelLevelPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${veh.fuelLevelPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {veh.notes && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">
                      "{veh.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Cond: {veh.condition}
                  </span>

                  <div>
                    {isAvailable && (
                      <button
                        onClick={() => onOpenDispatch(veh)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Dispatch Trip</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {isOnTrip && activeTrip && (
                      <button
                        onClick={() => onOpenReturn(activeTrip)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Check In Return</span>
                      </button>
                    )}

                    {isMaintenance && (
                      <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" />
                        Inspection Due
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
