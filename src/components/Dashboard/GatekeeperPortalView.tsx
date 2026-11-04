import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Truck, 
  Car, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass } from '../../types/visitor';
import { VehicleTrip } from '../../types/vehicle';
import { OrgConfigModal } from '../Settings/OrgConfigModal';

interface GatekeeperPortalViewProps {
  onLogout: () => void;
  onOpenRegistrations: () => void;
  onOpenCheckOuts: () => void;
  onOpenVehicleCheckIns: () => void;
  onSelectPassForBadge: (pass: VisitorPass) => void;
  onSelectPassForCheckOut: (pass: VisitorPass) => void;
  onSelectTripForReturn: (trip: VehicleTrip) => void;
}

export const GatekeeperPortalView: React.FC<GatekeeperPortalViewProps> = ({
  onLogout,
  onOpenRegistrations,
  onOpenCheckOuts,
  onOpenVehicleCheckIns,
  onSelectPassForBadge,
  onSelectPassForCheckOut,
}) => {
  const { 
    currentOfficer, 
    visitorPasses, 
    vehicles, 
    trips, 
    settings,
  } = useSecurity();

  const [searchQuery, setSearchQuery] = useState('');
  const [orgConfigOpen, setOrgConfigOpen] = useState(false);

  // Start of today for database timestamp queries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // --- Real Database Counters (100% computed from context data) ---
  
  // 1. Total guests registered or checked in today
  const todaysGuestsCount = visitorPasses.filter(
    (p) => new Date(p.entryTime) >= todayStart
  ).length;

  // 2. Currently Checked In (Active on-site headcount)
  const activePasses = visitorPasses.filter(
    (p) => p.status === 'ON_SITE' || p.status === 'OVERDUE'
  );
  const currentlyCheckedInCount = activePasses.length;

  // 3. Vehicles currently out on trips
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');
  const vehiclesOutCount = activeTrips.length;

  // 4. Vehicles ready and available in the compound
  const availableVehiclesCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;

  // Format today's date (matching reference, e.g. "21 Aug 2026")
  const formattedToday = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Initials for avatar
  const initials = currentOfficer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AE';

  // Filter activity list from real database
  const filteredPasses = visitorPasses.filter((pass) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      pass.visitorName.toLowerCase().includes(q) ||
      pass.visitorCompany.toLowerCase().includes(q) ||
      (pass.vehiclePlate && pass.vehiclePlate.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] via-[#edf6fd] to-[#e0f0fe] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 font-sans text-slate-800 select-none">
      {/* Responsive Container: Fluid on mobile (<640px), adapts cleanly to tablet (640-1024px) & desktop (>=1024px) */}
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Guard Profile Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            {/* Avatar bubble */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#a8b1bd] via-[#e5a089] to-[#d4896e] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {currentOfficer.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 tracking-wide uppercase">
                  {settings.organizationShortName || settings.organizationName || 'SECUREGATE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Staff ID: {currentOfficer.badgeNumber || '129'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Configure Organization (Admin only) & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            {currentOfficer.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setOrgConfigOpen(true)}
                title="Configure Organization Name & Terminal Branding"
                className="px-3 py-2 sm:py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 font-bold text-xs border border-sky-200 shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Configure Org</span>
                <span className="sm:hidden">Org</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#d32f2f] hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 3 Main Action Cards (Responsive Grid: 1 col on mobile, 3 cols on tablet & desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Registrations & Logins */}
          <button
            type="button"
            onClick={onOpenRegistrations}
            className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 hover:border-sky-300 hover:shadow-md active:scale-[0.99] transition-all flex items-center sm:flex-col sm:items-start lg:flex-row lg:items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f0f6ff] border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
              <span className="text-2xl">📝</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-sky-700 transition-colors truncate">
                Registrations & Logins
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                New & Returning Guests
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 sm:hidden lg:block" />
          </button>

          {/* Card 2: Check Outs */}
          <button
            type="button"
            onClick={onOpenCheckOuts}
            className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 hover:border-orange-300 hover:shadow-md active:scale-[0.99] transition-all flex items-center sm:flex-col sm:items-start lg:flex-row lg:items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
              <span className="text-2xl">🚪</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-orange-700 transition-colors truncate">
                Check Outs
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                Vehicles & Guests
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0 sm:hidden lg:block" />
          </button>

          {/* Card 3: Vehicle Check Ins */}
          <button
            type="button"
            onClick={onOpenVehicleCheckIns}
            className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 hover:border-rose-300 hover:shadow-md active:scale-[0.99] transition-all flex items-center sm:flex-col sm:items-start lg:flex-row lg:items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#fff1f2] border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
              <span className="text-2xl">🚗</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-rose-700 transition-colors truncate">
                {settings.organizationShortName || settings.organizationName || 'SECUREGATE'} Vehicle Check Ins
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                Return checked-out vehicles
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0 sm:hidden lg:block" />
          </button>
        </div>

        {/* 4 Metric Cards (Driven 100% by real database data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric Card 1: Today's Guests */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Today's Guests
              </span>
              <div className="w-10 h-10 rounded-2xl bg-sky-100/70 text-sky-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {todaysGuestsCount}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Registered or logged in today
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Total entries today</span>
            </div>
          </div>

          {/* Metric Card 2: Currently Checked In */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Currently Checked In
              </span>
              <div className="w-10 h-10 rounded-2xl bg-orange-100/70 text-orange-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {currentlyCheckedInCount}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                In the compound
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Active guests</span>
            </div>
          </div>

          {/* Metric Card 3: Vehicles Out (Red top bar) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 relative overflow-hidden border-t-4 border-t-red-500 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500 truncate" title={`${settings.organizationShortName || settings.organizationName || 'SECUREGATE'} Vehicles Out`}>
                {settings.organizationShortName || settings.organizationName || 'SECUREGATE'} Vehicles Out
              </span>
              <div className="w-10 h-10 rounded-2xl bg-red-100/70 text-red-500 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {vehiclesOutCount}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Currently in use
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
              <span>Out of fleet</span>
            </div>
          </div>

          {/* Metric Card 4: Available Vehicles (Green top bar) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 relative overflow-hidden border-t-4 border-t-emerald-500 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Available Vehicles
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-500 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {availableVehiclesCount}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Ready for checkout
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Available now</span>
            </div>
          </div>
        </div>

        {/* Today's Activity Table Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-sky-100 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Today's Activity
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                {formattedToday}
              </span>
            </div>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, plate..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
            />
          </div>

          {/* Activity Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse text-xs min-w-[320px] sm:min-w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">NAME</th>
                  <th className="pb-2.5 font-semibold text-center">TYPE</th>
                  <th className="pb-2.5 font-semibold text-center">TIME</th>
                  <th className="pb-2.5 font-semibold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPasses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                      No matching activity found.
                    </td>
                  </tr>
                ) : (
                  filteredPasses.slice(0, 10).map((pass) => {
                    const isCheckedOut = pass.status === 'CHECKED_OUT';
                    const isStaff = pass.visitorCompany?.toLowerCase().includes('staff') || pass.idType === 'Corporate Badge';
                    const formattedTime = new Date(pass.actualDepartureTime || pass.entryTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={pass.id}
                        onClick={() => onSelectPassForBadge(pass)}
                        className="hover:bg-sky-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 pr-2">
                          <p className="font-bold text-slate-900 leading-tight group-hover:text-sky-700 transition-colors">
                            {pass.visitorName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                            {pass.visitorCompany && !isStaff && (
                              <span>{pass.visitorCompany}</span>
                            )}
                            {pass.vehiclePlate && (
                              <span className="font-mono text-slate-600 text-[10px] bg-slate-100 px-1 rounded">
                                {pass.vehiclePlate}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              isStaff
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isStaff ? 'Staff' : 'Visitor'}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {formattedTime}
                        </td>

                        <td className="py-3 pl-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[10px] font-bold leading-tight ${
                                isCheckedOut
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isCheckedOut ? '✗ Checked Out' : '✓ On-Site'}
                            </span>

                            {!isCheckedOut && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectPassForCheckOut(pass);
                                }}
                                title="Quick Check Out"
                                className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-[10px] font-bold transition-all border border-rose-200"
                              >
                                Out
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Organization Configuration Modal */}
      <OrgConfigModal
        isOpen={orgConfigOpen}
        onClose={() => setOrgConfigOpen(false)}
      />
    </div>
  );
};
