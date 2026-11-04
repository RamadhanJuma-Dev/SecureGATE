import React from 'react';
import { 
  Users, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  UserPlus, 
  ArrowLeftRight, 
  Building2, 
  Radio, 
  UserCheck, 
  Flame,
  Search,
  ExternalLink
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass } from '../../types/visitor';
import { OrgVehicle, VehicleTrip } from '../../types/vehicle';

interface DashboardViewProps {
  onOpenRegister: () => void;
  onOpenReturningLookup: () => void;
  onOpenScanner: () => void;
  onOpenEvacuation: () => void;
  onOpenDispatch: (vehicle?: OrgVehicle) => void;
  onOpenReturnVehicle: (trip: VehicleTrip) => void;
  onSelectPassForCheckOut: (pass: VisitorPass) => void;
  onSelectPassForBadge: (pass: VisitorPass) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRegister,
  onOpenReturningLookup,
  onOpenScanner,
  onOpenEvacuation,
  onOpenDispatch,
  onOpenReturnVehicle,
  onSelectPassForCheckOut,
  onSelectPassForBadge,
  onNavigateTab,
}) => {
  const { 
    visitorPasses, 
    vehicles, 
    trips, 
    settings, 
    activeGate,
    auditLogs 
  } = useSecurity();

  // Visitor calculations
  const onSiteVisitors = visitorPasses.filter(
    (p) => p.status === 'ON_SITE' || p.status === 'OVERDUE'
  );
  const overdueVisitors = visitorPasses.filter((p) => p.status === 'OVERDUE');
  const checkedOutToday = visitorPasses.filter((p) => p.status === 'CHECKED_OUT').length;
  const totalEntriesToday = visitorPasses.length;

  // Occupancy percentage against configured facility capacity
  const maxCapacity = settings.maxPremiseCapacity || 80;
  const occupancyPercent = Math.min(100, Math.round((onSiteVisitors.length / maxCapacity) * 100));

  // Vehicle calculations
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');
  const onTripVehicles = vehicles.filter((v) => v.status === 'ON_TRIP');
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'MAINTENANCE' || v.status === 'GROUNDED');
  const fleetAvailabilityRate = totalVehicles > 0 ? Math.round((availableVehicles.length / totalVehicles) * 100) : 0;

  // Active trips
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Gate Post info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Live Operations Monitoring
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-mono">{activeGate.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Security Control & Gate Movement Command
          </h1>
          <p className="text-xs text-slate-400">
            Automated visitor registration, returning visitor clearance, and organizational fleet tracking
          </p>
        </div>

        {/* Quick Action Button Cluster */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenReturningLookup}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/80 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Returning Visitor</span>
          </button>

          <button
            onClick={onOpenRegister}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Check In Visitor</span>
          </button>

          <button
            onClick={() => onOpenDispatch()}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatch Fleet</span>
          </button>

          <button
            onClick={onOpenScanner}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Scan Pass Barcode / QR Code"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Overdue Visitor Emergency Alert Banner (if any) */}
      {overdueVisitors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 text-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-900/60 flex items-center justify-center text-rose-300 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                SECURITY ATTENTION: {overdueVisitors.length} Visitor(s) Have Exceeded Authorized Dwell Time
              </p>
              <p className="text-rose-300 text-[11px] mt-0.5">
                {overdueVisitors.map((v) => `${v.visitorName} (Host: ${v.hostName})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('visitors_log')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
          >
            <span>Review Overstays</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Visitor Occupancy */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">
              Visitor Occupancy
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {onSiteVisitors.length}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / {maxCapacity} Max Capacity
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>{occupancyPercent}% facility capacity</span>
            <span className="text-emerald-400 font-mono font-medium">
              {maxCapacity - onSiteVisitors.length} slots free
            </span>
          </div>
        </div>

        {/* Metric 2: Overstay / Compliance Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">
              Overstaying Visitors
            </span>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              overdueVisitors.length > 0
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <Clock className="w-4 h-4" />
            </span>
          </div>

          <div>
            <span className={`text-3xl font-bold font-mono tabular-nums ${
              overdueVisitors.length > 0 ? 'text-rose-400' : 'text-white'
            }`}>
              {overdueVisitors.length}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {overdueVisitors.length > 0 ? 'Requires guard room contact' : 'All visits within authorized duration'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Checked Out Today:</span>
            <span className="font-mono text-white font-semibold">{checkedOutToday}</span>
          </div>
        </div>

        {/* Metric 3: Organizational Fleet Availability */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">
              Fleet Yard Availability
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {availableVehicles.length}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / {totalVehicles} Total Fleet
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${fleetAvailabilityRate}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>{fleetAvailabilityRate}% Yard readiness</span>
            <span className="text-amber-400 font-mono font-medium">
              {onTripVehicles.length} out on route
            </span>
          </div>
        </div>

        {/* Metric 4: Daily Movements & Total Gate Volume */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium">
              Today's Gate Throughput
            </span>
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {totalEntriesToday + trips.length}
              </span>
              <span className="text-xs text-slate-400">Total Movements</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalEntriesToday} visitor passes · {trips.length} fleet trips
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Terminal:</span>
            <span className="font-mono text-emerald-400 truncate max-w-[140px]">
              {activeGate.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Viewport: Live Visitors On-Site + Live Fleet On-Trip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Visitors Currently On Premise */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Live On-Premise Visitors ({onSiteVisitors.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('visitors_log')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Visitors Card List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {onSiteVisitors.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-400">No visitors currently on premise</p>
              </div>
            ) : (
              onSiteVisitors.map((pass) => {
                const isOverdue = pass.status === 'OVERDUE';
                return (
                  <div
                    key={pass.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isOverdue
                        ? 'bg-rose-950/30 border-rose-800/80'
                        : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {pass.photoUrl ? (
                          <img
                            src={pass.photoUrl}
                            alt={pass.visitorName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                            {pass.visitorName.charAt(0)}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{pass.visitorName}</span>
                            <span className="font-mono text-[10px] text-emerald-400">
                              {pass.badgeNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {pass.visitorCompany} · Host: <strong className="text-slate-200">{pass.hostName}</strong>
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>In: {new Date(pass.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>·</span>
                            <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              Exp: {new Date(pass.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {pass.vehiclePlate && (
                              <>
                                <span>·</span>
                                <span className="text-slate-300">Car: {pass.vehiclePlate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Fast Check Out Action */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onSelectPassForBadge(pass)}
                          title="View Official Badge"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectPassForCheckOut(pass)}
                          className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-800 text-xs font-semibold transition-colors"
                        >
                          Check Out
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Fast Check-Out supported via pass QR scan or search</span>
            <button
              onClick={onOpenRegister}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              + Register Walk-In
            </button>
          </div>
        </div>

        {/* Right: Active Organizational Vehicles On Missions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Active Organizational Fleet Movements ({activeTrips.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('trips')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>View All Trips</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Trips Card List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {activeTrips.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Truck className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-medium text-slate-400">All fleet vehicles currently on fleet yard</p>
              </div>
            ) : (
              activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{trip.fleetNumber}</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                          {trip.plateNumber}
                        </span>
                        <span className="text-xs text-slate-300">· {trip.makeModel}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Driver: <strong className="text-white">{trip.driverName}</strong> ({trip.department})
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-sm">
                        Destination: {trip.destination}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenReturnVehicle(trip)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Check In</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                    <span>Dep Odo: {trip.departureOdometer.toLocaleString()} km</span>
                    <span>Start Fuel: {trip.departureFuelPercent}%</span>
                    <span className="text-right text-amber-400">
                      Exp: {new Date(trip.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Pre-trip & post-trip vehicle checklists enforced</span>
            <button
              onClick={() => onOpenDispatch()}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              + Dispatch Available Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Recent Security Activity Stream */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Real-Time Security Gate Log Stream
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('audit')}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Full Audit Log
          </button>
        </div>

        <div className="space-y-1.5">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    log.severity === 'WARNING' || log.severity === 'ALERT'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-300 truncate max-w-md">{log.details}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {log.officerName} · {log.gate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
