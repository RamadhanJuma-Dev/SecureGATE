import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  LogOut, 
  Printer, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Car,
  UserCheck,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass, VisitorStatus } from '../../types/visitor';

interface VisitorMovementLogViewProps {
  onOpenRegister: () => void;
  onOpenReturningLookup: () => void;
  onSelectPassForBadge: (pass: VisitorPass) => void;
  onSelectPassForCheckOut: (pass: VisitorPass) => void;
}

export const VisitorMovementLogView: React.FC<VisitorMovementLogViewProps> = ({
  onOpenRegister,
  onOpenReturningLookup,
  onSelectPassForBadge,
  onSelectPassForCheckOut,
}) => {
  const { visitorPasses, toggleWatchlist, currentOfficer } = useSecurity();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VisitorStatus>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const isSupervisorOrAdmin = currentOfficer.role === 'SUPERVISOR' || currentOfficer.role === 'ADMIN';

  // Filtered passes
  const filtered = visitorPasses.filter((pass) => {
    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ON_SITE') {
        if (pass.status !== 'ON_SITE' && pass.status !== 'OVERDUE') return false;
      } else if (pass.status !== statusFilter) {
        return false;
      }
    }

    // Department filter
    if (selectedDept !== 'ALL' && pass.hostDepartment !== selectedDept) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        pass.visitorName.toLowerCase().includes(q) ||
        pass.visitorCompany.toLowerCase().includes(q) ||
        pass.badgeNumber.toLowerCase().includes(q) ||
        pass.hostName.toLowerCase().includes(q) ||
        pass.idNumber.toLowerCase().includes(q) ||
        (pass.vehiclePlate && pass.vehiclePlate.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const onSiteCount = visitorPasses.filter((p) => p.status === 'ON_SITE' || p.status === 'OVERDUE').length;
  const overdueCount = visitorPasses.filter((p) => p.status === 'OVERDUE').length;
  const checkedOutCount = visitorPasses.filter((p) => p.status === 'CHECKED_OUT').length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Visitor Movement Registry & Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time entry & departure tracking, asset inspection, and digital gate credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReturningLookup}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Returning Visitor</span>
          </button>
          <button
            onClick={onOpenRegister}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>+ Check In New Visitor</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Passes ({visitorPasses.length})
            </button>
            <button
              onClick={() => setStatusFilter('ON_SITE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'ON_SITE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              On-Premise ({onSiteCount})
            </button>
            <button
              onClick={() => setStatusFilter('OVERDUE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'OVERDUE'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overstay Alert ({overdueCount})
            </button>
            <button
              onClick={() => setStatusFilter('CHECKED_OUT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'CHECKED_OUT'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Checked Out ({checkedOutCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search visitor, badge, company, host, plate..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Movement Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-medium">VISITOR & BADGE</th>
                <th className="py-3 px-4 font-medium">ORGANIZATION</th>
                <th className="py-3 px-4 font-medium">HOST & PURPOSE</th>
                <th className="py-3 px-4 font-medium">ENTRY GATE & TIME</th>
                <th className="py-3 px-4 font-medium">DEPARTURE</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No visitor records matching criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or registering a visitor.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((pass) => {
                  const isOnSite = pass.status === 'ON_SITE' || pass.status === 'OVERDUE';
                  const isOverdue = pass.status === 'OVERDUE';
                  const isCheckedOut = pass.status === 'CHECKED_OUT';

                  return (
                    <tr key={pass.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Visitor Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {pass.photoUrl ? (
                            <img
                              src={pass.photoUrl}
                              alt={pass.visitorName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                              {pass.visitorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white leading-tight">{pass.visitorName}</p>
                            <p className="font-mono text-[11px] text-emerald-400 mt-0.5">
                              {pass.badgeNumber}
                            </p>
                            {pass.vehiclePlate && (
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                <Car className="w-2.5 h-2.5 text-slate-500" />
                                {pass.vehiclePlate}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Organization */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-200">{pass.visitorCompany}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {pass.idType}: {pass.idNumber}
                        </p>
                        {pass.assetsCarried && pass.assetsCarried.length > 0 && (
                          <span className="text-[10px] text-slate-500">
                            {pass.assetsCarried.length} asset(s) logged
                          </span>
                        )}
                      </td>

                      {/* Host & Purpose */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-white">{pass.hostName}</p>
                        <p className="text-[11px] text-slate-400">{pass.hostDepartment}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{pass.purpose}</p>
                      </td>

                      {/* Entry */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <p className="text-slate-200 font-semibold">
                          {new Date(pass.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          {new Date(pass.entryTime).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {pass.entryGate}
                        </p>
                      </td>

                      {/* Departure */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {isCheckedOut && pass.actualDepartureTime ? (
                          <>
                            <p className="text-slate-300 font-semibold">
                              {new Date(pass.actualDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-slate-500 text-[10px]">
                              {new Date(pass.actualDepartureTime).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-slate-500">Gate: {pass.exitGate}</p>
                          </>
                        ) : (
                          <>
                            <p className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              Exp: {new Date(pass.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {pass.expectedDurationHours}h authorized
                            </p>
                          </>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            isCheckedOut
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : isOverdue
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isCheckedOut && <CheckCircle2 className="w-3 h-3" />}
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {!isCheckedOut && !isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                          {isOverdue ? 'OVERSTAY' : isCheckedOut ? 'CHECKED OUT' : 'ON-PREMISE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Badge Pass Preview */}
                          <button
                            onClick={() => onSelectPassForBadge(pass)}
                            title="View / Print Official Gate Badge Pass"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Check Out Button */}
                          {isOnSite && (
                            <button
                              onClick={() => onSelectPassForCheckOut(pass)}
                              title="Check Out Visitor"
                              className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Check Out</span>
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
  );
};
