import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  Users, 
  Truck, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useSecurity } from '../../context/SecurityContext';
import { getDerivedPassStatus } from '../../utils/visitorUtils';

export const MovementReportsView: React.FC = () => {
  const { visitorPasses, trips, settings, exportBackupJson } = useSecurity();

  const [reportType, setReportType] = useState<'ALL' | 'VISITORS' | 'VEHICLES'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const [visitorPage, setVisitorPage] = useState(1);
  const [tripPage, setTripPage] = useState(1);
  const pageSize = 15;

  // Reset pagination when filters change
  useEffect(() => {
    setVisitorPage(1);
    setTripPage(1);
  }, [debouncedSearch, deptFilter, dateFilter, reportType]);

  // Filter visitors
  const filteredVisitors = visitorPasses.filter((p) => {
    if (deptFilter !== 'ALL' && p.hostDepartment !== deptFilter) return false;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      const match =
        p.visitorName.toLowerCase().includes(q) ||
        p.visitorCompany.toLowerCase().includes(q) ||
        p.badgeNumber.toLowerCase().includes(q) ||
        p.hostName.toLowerCase().includes(q) ||
        (p.vehiclePlate && p.vehiclePlate.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    if (deptFilter !== 'ALL' && t.department !== deptFilter) return false;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      const match =
        t.tripPassNumber.toLowerCase().includes(q) ||
        t.fleetNumber.toLowerCase().includes(q) ||
        t.plateNumber.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Pagination slicing
  const totalVisitorPages = Math.ceil(filteredVisitors.length / pageSize) || 1;
  const visitorStartIndex = (visitorPage - 1) * pageSize;
  const paginatedVisitors = filteredVisitors.slice(visitorStartIndex, visitorStartIndex + pageSize);

  const totalTripPages = Math.ceil(filteredTrips.length / pageSize) || 1;
  const tripStartIndex = (tripPage - 1) * pageSize;
  const paginatedTrips = filteredTrips.slice(tripStartIndex, tripStartIndex + pageSize);

  // Export CSV
  const handleExportVisitorsCsv = () => {
    const headers = [
      'Badge Number',
      'Visitor Name',
      'Company',
      'ID Type',
      'ID Number',
      'Phone',
      'Host Staff',
      'Department',
      'Purpose',
      'Entry Time',
      'Departure Time',
      'Status',
      'Vehicle Plate',
      'Check-In Officer',
      'Check-Out Officer',
    ];

    const rows = filteredVisitors.map((p) => {
      const derivedStatus = getDerivedPassStatus(p);
      return [
        p.badgeNumber,
        `"${p.visitorName}"`,
        `"${p.visitorCompany}"`,
        p.idType,
        p.idNumber,
        p.visitorPhone,
        `"${p.hostName}"`,
        `"${p.hostDepartment}"`,
        `"${p.purpose}"`,
        p.entryTime,
        p.actualDepartureTime || 'On-Site',
        derivedStatus,
        p.vehiclePlate || 'N/A',
        `"${p.officerCheckInName}"`,
        `"${p.officerCheckOutName || 'N/A'}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security-visitor-movement-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportTripsCsv = () => {
    const headers = [
      'Trip Pass Number',
      'Fleet ID',
      'Plate Number',
      'Driver Name',
      'Staff ID',
      'Destination',
      'Purpose',
      'Department',
      'Departure Time',
      'Return Time',
      'Departure Odometer',
      'Return Odometer',
      'Distance (KM)',
      'Status',
      'Departure Officer',
      'Return Officer',
    ];

    const rows = filteredTrips.map((t) => [
      t.tripPassNumber,
      t.fleetNumber,
      t.plateNumber,
      `"${t.driverName}"`,
      t.driverEmployeeId,
      `"${t.destination}"`,
      `"${t.purpose}"`,
      `"${t.department}"`,
      t.departureTime,
      t.actualReturnTime || 'In Transit',
      t.departureOdometer,
      t.returnOdometer || 'N/A',
      t.distanceTraveledKm || 'N/A',
      t.status,
      `"${t.officerDepartureName}"`,
      `"${t.officerReturnName || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security-fleet-movements-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Security & Facility Movement Audit Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Export certified gate movement records, vehicle trip logbooks, and occupancy logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportVisitorsCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Visitors CSV</span>
          </button>

          <button
            onClick={handleExportTripsCsv}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Trips CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Report Category Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setReportType('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                reportType === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified Overview
            </button>
            <button
              onClick={() => setReportType('VISITORS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                reportType === 'VISITORS'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visitor Registry ({filteredVisitors.length})</span>
            </button>
            <button
              onClick={() => setReportType('VEHICLES')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                reportType === 'VEHICLES'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Fleet Trips ({filteredTrips.length})</span>
            </button>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-500" />
              Dept:
            </span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
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

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report entries by name, badge, vehicle plate, trip pass, destination..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80"
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

      {/* Report Records: Visitor Section */}
      {(reportType === 'ALL' || reportType === 'VISITORS') && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Visitor Gate Movement Records ({filteredVisitors.length})
          </h2>

          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">BADGE #</th>
                  <th className="py-2.5 px-3 font-medium">VISITOR NAME</th>
                  <th className="py-2.5 px-3 font-medium">ORGANIZATION</th>
                  <th className="py-2.5 px-3 font-medium">HOST / DEPT</th>
                  <th className="py-2.5 px-3 font-medium">ENTRY</th>
                  <th className="py-2.5 px-3 font-medium">DEPARTURE</th>
                  <th className="py-2.5 px-3 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {paginatedVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No visitor movement records matching filters.
                    </td>
                  </tr>
                ) : (
                  paginatedVisitors.map((p) => {
                    const derivedStatus = getDerivedPassStatus(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{p.badgeNumber}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">{p.visitorName}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">{p.visitorCompany}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">
                          {p.hostName} ({p.hostDepartment})
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {new Date(p.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {p.actualDepartureTime
                            ? new Date(p.actualDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'On-Site'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            derivedStatus === 'CHECKED_OUT'
                              ? 'bg-slate-800 text-slate-400'
                              : derivedStatus === 'OVERDUE'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}>
                            {derivedStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Visitors Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing {filteredVisitors.length === 0 ? 0 : visitorStartIndex + 1}–{Math.min(visitorStartIndex + pageSize, filteredVisitors.length)} of {filteredVisitors.length} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={visitorPage <= 1}
                  onClick={() => setVisitorPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="font-mono text-slate-400">
                  Page {visitorPage} of {totalVisitorPages}
                </span>
                <button
                  disabled={visitorPage >= totalVisitorPages}
                  onClick={() => setVisitorPage((p) => Math.min(totalVisitorPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Records: Vehicle Section */}
      {(reportType === 'ALL' || reportType === 'VEHICLES') && (
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            Organizational Fleet Trip Movement Records ({filteredTrips.length})
          </h2>

          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">TRIP ID</th>
                  <th className="py-2.5 px-3 font-medium">VEHICLE & PLATE</th>
                  <th className="py-2.5 px-3 font-medium">DRIVER</th>
                  <th className="py-2.5 px-3 font-medium">DESTINATION</th>
                  <th className="py-2.5 px-3 font-medium">START ODO</th>
                  <th className="py-2.5 px-3 font-medium">RETURN ODO</th>
                  <th className="py-2.5 px-3 font-medium">DISTANCE</th>
                  <th className="py-2.5 px-3 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {paginatedTrips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      No vehicle movement records matching filters.
                    </td>
                  </tr>
                ) : (
                  paginatedTrips.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-amber-400">{t.tripPassNumber}</td>
                      <td className="py-2.5 px-3 text-white font-semibold">
                        {t.fleetNumber} ({t.plateNumber})
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{t.driverName}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300 truncate max-w-xs">{t.destination}</td>
                      <td className="py-2.5 px-3 text-slate-300">{t.departureOdometer.toLocaleString()} km</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {t.returnOdometer ? `${t.returnOdometer.toLocaleString()} km` : 'Active'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">
                        {t.distanceTraveledKm ? `${t.distanceTraveledKm} km` : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          t.status === 'RETURNED'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Trips Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing {filteredTrips.length === 0 ? 0 : tripStartIndex + 1}–{Math.min(tripStartIndex + pageSize, filteredTrips.length)} of {filteredTrips.length} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={tripPage <= 1}
                  onClick={() => setTripPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="font-mono text-slate-400">
                  Page {tripPage} of {totalTripPages}
                </span>
                <button
                  disabled={tripPage >= totalTripPages}
                  onClick={() => setTripPage((p) => Math.min(totalTripPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Signature Block for Print */}
      <div className="print-only pt-8 border-t border-black mt-8 text-xs">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold">Chief Security Officer / Watch Commander:</p>
            <div className="mt-8 border-b border-black w-48"></div>
            <p className="mt-1 text-[10px]">Signature & Date</p>
          </div>
          <div>
            <p className="font-bold">Facility Operations Director:</p>
            <div className="mt-8 border-b border-black w-48"></div>
            <p className="mt-1 text-[10px]">Signature & Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};
