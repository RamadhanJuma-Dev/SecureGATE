import React, { useState, useEffect } from 'react';
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
import { useDebounce } from 'use-debounce';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass, VisitorStatus } from '../../types/visitor';
import { getDerivedPassStatus } from '../../utils/visitorUtils';

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
  const [debouncedSearch] = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<'ALL' | VisitorStatus>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const isSupervisorOrAdmin = currentOfficer.role === 'SUPERVISOR' || currentOfficer.role === 'ADMIN';

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, selectedDept]);

  // Filtered passes
  const filtered = visitorPasses.filter((pass) => {
    const derivedStatus = getDerivedPassStatus(pass);

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ON_SITE') {
        if (derivedStatus !== 'ON_SITE' && derivedStatus !== 'OVERDUE') return false;
      } else if (derivedStatus !== statusFilter) {
        return false;
      }
    }

    // Department filter
    if (selectedDept !== 'ALL' && pass.hostDepartment !== selectedDept) {
      return false;
    }

    // Search query
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
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

  const onSiteCount = visitorPasses.filter((p) => {
    const status = getDerivedPassStatus(p);
    return status === 'ON_SITE' || status === 'OVERDUE';
  }).length;
  const overdueCount = visitorPasses.filter((p) => getDerivedPassStatus(p) === 'OVERDUE').length;
  const checkedOutCount = visitorPasses.filter((p) => getDerivedPassStatus(p) === 'CHECKED_OUT').length;

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPasses = filtered.slice(startIndex, startIndex + pageSize);

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
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'ON_SITE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>On-Site ({onSiteCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('OVERDUE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === 'OVERDUE'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Overdue ({overdueCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('CHECKED_OUT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'CHECKED_OUT'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Departed ({checkedOutCount})
            </button>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Dept:</span>
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-slate-600"
            >
              <option value="ALL">All Departments</option>
              <option value="Executive Management">Executive Management</option>
              <option value="Engineering & Tech">Engineering & Tech</option>
              <option value="Operations & Logistics">Operations & Logistics</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Legal & Compliance">Legal & Compliance</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visitor passes by visitor name, badge number, national ID, company, host, or vehicle plate..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 tracking-wider uppercase font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">VISITOR & BADGE</th>
                <th className="py-3 px-4 font-medium">ORGANIZATION / ID</th>
                <th className="py-3 px-4 font-medium">HOST & PURPOSE</th>
                <th className="py-3 px-4 font-medium">ENTRY DETAILS</th>
                <th className="py-3 px-4 font-medium">DEPARTURE</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedPasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No visitor records matching criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or registering a visitor.</p>
                  </td>
                </tr>
              ) : (
                paginatedPasses.map((pass) => {
                  const derivedStatus = getDerivedPassStatus(pass);
                  const isOnSite = derivedStatus === 'ON_SITE' || derivedStatus === 'OVERDUE';
                  const isOverdue = derivedStatus === 'OVERDUE';
                  const isCheckedOut = derivedStatus === 'CHECKED_OUT';

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

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Previous
            </button>
            <span className="font-mono text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
