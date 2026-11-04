import React, { useState } from 'react';
import { 
  Users, 
  Truck, 
  Clock, 
  AlertTriangle, 
  Search, 
  Download, 
  UserCheck, 
  AlertOctagon, 
  FileText,
  Eye,
  LogOut,
  MapPin,
  Calendar
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass } from '../../types/visitor';
import { VehicleTrip } from '../../types/vehicle';
import { getDerivedPassStatus } from '../../utils/visitorUtils';

interface SecuritySupervisorDashboardViewProps {
  onLogout: () => void;
  onSelectPassForDetails?: (pass: VisitorPass) => void;
  onSelectTripForDetails?: (trip: VehicleTrip) => void;
}

export const SecuritySupervisorDashboardView: React.FC<SecuritySupervisorDashboardViewProps> = ({
  onLogout,
  onSelectPassForDetails,
  onSelectTripForDetails,
}) => {
  const {
    currentOfficer,
    visitorPasses,
    vehicles,
    trips,
    auditLogs,
    settings,
  } = useSecurity();

  const [activeTab, setActiveTab] = useState<
    'live-compound' | 'vehicle-transit' | 'officer-activity' | 'investigate' | 'reports'
  >('live-compound');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_SITE' | 'OVERDUE' | 'CHECKED_OUT'>('ALL');

  // Compute live operational metrics
  const onSiteVisitors = visitorPasses.filter(
    (p) => {
      const status = getDerivedPassStatus(p);
      return status === 'ON_SITE' || status === 'OVERDUE';
    }
  );
  const overdueVisitors = visitorPasses.filter((p) => getDerivedPassStatus(p) === 'OVERDUE');
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');

  // Flagged vehicle trips (returned with condition damage remarks or abnormal fuel drop)
  const flaggedTrips = trips.filter((t) => {
    if (t.status === 'RETURNED' && t.returnFuelPercent !== undefined && t.departureFuelPercent) {
      if (t.departureFuelPercent - t.returnFuelPercent > 40) return true;
    }
    if (t.tripNotes && (t.tripNotes.toLowerCase().includes('damage') || t.tripNotes.toLowerCase().includes('scratch') || t.tripNotes.toLowerCase().includes('issue'))) {
      return true;
    }
    if (t.returnChecklist?.remarks && (t.returnChecklist.remarks.toLowerCase().includes('scratch') || t.returnChecklist.remarks.toLowerCase().includes('dent') || t.returnChecklist.remarks.toLowerCase().includes('fault'))) {
      return true;
    }
    return false;
  });

  // Filtered passes for live table
  const filteredPasses = visitorPasses.filter((p) => {
    const derivedStatus = getDerivedPassStatus(p);
    if (statusFilter !== 'ALL' && derivedStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.visitorName.toLowerCase().includes(q) ||
        p.visitorCompany.toLowerCase().includes(q) ||
        p.hostName.toLowerCase().includes(q) ||
        p.badgeNumber.toLowerCase().includes(q) ||
        (p.vehiclePlate && p.vehiclePlate.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export report to CSV
  const handleExportCsv = (type: 'visitors' | 'vehicles') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'visitors') {
      csvContent += 'Badge,Visitor Name,Company,Host,Department,Entry Time,Departure Time,Status,Officer\n';
      filteredPasses.forEach((p) => {
        const derivedStatus = getDerivedPassStatus(p);
        csvContent += `"${p.badgeNumber}","${p.visitorName}","${p.visitorCompany}","${p.hostName}","${p.hostDepartment}","${p.entryTime}","${p.actualDepartureTime || 'N/A'}","${derivedStatus}","${p.officerCheckInName}"\n`;
      });
    } else {
      csvContent += 'Trip ID,Fleet #,Plate,Driver,Destination,Departure Time,Return Time,Status,Departure Odometer,Return Odometer\n';
      trips.forEach((t) => {
        csvContent += `"${t.tripPassNumber}","${t.fleetNumber}","${t.plateNumber}","${t.driverName}","${t.destination}","${t.departureTime}","${t.actualReturnTime || 'N/A'}","${t.status}","${t.departureOdometer}","${t.returnOdometer || 'N/A'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_movement_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initials = currentOfficer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ER';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] via-[#edf6fd] to-[#e0f0fe] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 font-sans text-slate-800 select-none">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Supervisor Profile Card (Unified with Gatekeeper style) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {currentOfficer.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wide uppercase">
                  SECURITY SUPERVISOR
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 tracking-wide uppercase hidden sm:inline-block">
                  {settings.organizationShortName || settings.organizationName || 'SECUREGATE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Supervisor ID: {currentOfficer.badgeNumber} • Operations Oversight & Movement Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#d32f2f] hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 4 Real-Time Operational Monitoring Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Live Compound Occupancy */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Visitors In Compound
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {onSiteVisitors.length}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Active guests on premises
              </p>
            </div>
            <div className="pt-2 text-xs text-emerald-600 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live on-site roll across gates</span>
            </div>
          </div>

          {/* Card 2: Overstay Warnings */}
          <div className={`bg-white rounded-3xl p-5 shadow-sm border space-y-2 flex flex-col justify-between ${
            overdueVisitors.length > 0 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-sky-100'
          }`}>
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Overstay Warnings
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${
                overdueVisitors.length > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {overdueVisitors.length}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Exceeded pass duration
              </p>
            </div>
            <div className="pt-2 text-xs text-amber-600 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Requires security follow-up</span>
            </div>
          </div>

          {/* Card 3: Vehicles In Transit */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Vehicles In Transit
              </span>
              <div className="w-10 h-10 rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {activeTrips.length}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Dispatched outside premises
              </p>
            </div>
            <div className="pt-2 text-xs text-sky-600 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Active organizational fleet</span>
            </div>
          </div>

          {/* Card 4: Flagged Vehicle Conditions */}
          <div className={`bg-white rounded-3xl p-5 shadow-sm border space-y-2 flex flex-col justify-between ${
            flaggedTrips.length > 0 ? 'border-rose-300 ring-1 ring-rose-200' : 'border-sky-100'
          }`}>
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Flagged Discrepancies
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${
                flaggedTrips.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {flaggedTrips.length}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Damage / fuel flags
              </p>
            </div>
            <div className="pt-2 text-xs text-rose-600 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Vehicle condition review</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Pill style matching uniform aesthetic) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('live-compound')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'live-compound'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Compound Visitors ({onSiteVisitors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicle-transit')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'vehicle-transit'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Vehicle Movements ({activeTrips.length} Active)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('officer-activity')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'officer-activity'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Security Officers' Activities</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('investigate')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'investigate'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Investigation & Flags</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Generate Movement Reports</span>
          </button>
        </div>

        {/* TAB 1: COMPOUND VISITORS */}
        {activeTab === 'live-compound' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-sm">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search guest name, host, plate, badge..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ON_SITE">Currently On-Site</option>
                  <option value="OVERDUE">Overdue Only</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleExportCsv('visitors')}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Export Visitor CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50/70 text-slate-600 font-semibold border-b border-sky-100">
                    <tr>
                      <th className="px-5 py-3.5">Visitor</th>
                      <th className="px-4 py-3.5">Host & Dept</th>
                      <th className="px-4 py-3.5">Entry Time</th>
                      <th className="px-4 py-3.5">Expected Departure</th>
                      <th className="px-4 py-3.5">Admitting Guard</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100/60 font-medium">
                    {filteredPasses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                          No visitor records matched your search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPasses.map((pass) => (
                        <tr 
                          key={pass.id} 
                          onClick={() => onSelectPassForDetails && onSelectPassForDetails(pass)}
                          className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-3.5">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{pass.visitorName}</p>
                              <p className="text-[11px] text-slate-500">{pass.visitorCompany} • <span className="font-mono text-slate-600">{pass.badgeNumber}</span></p>
                              {pass.vehiclePlate && (
                                <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  🚗 {pass.vehiclePlate}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="text-slate-800 font-semibold">{pass.hostName}</p>
                            <p className="text-[11px] text-slate-500">{pass.hostDepartment}</p>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-700">
                            {new Date(pass.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-700">
                            {new Date(pass.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="px-4 py-3.5 text-slate-500">
                            {pass.officerCheckInName}
                          </td>

                          <td className="px-4 py-3.5">
                            {(() => {
                              const derivedStatus = getDerivedPassStatus(pass);
                              return (
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  derivedStatus === 'ON_SITE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : derivedStatus === 'OVERDUE'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse font-extrabold'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {derivedStatus === 'ON_SITE' ? '✓ On-Site' : derivedStatus === 'OVERDUE' ? '⚠ Overdue' : '✗ Departed'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VEHICLE MOVEMENTS */}
        {activeTab === 'vehicle-transit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-sky-100 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Organizational Dispatches & Transit</h2>
                <p className="text-xs text-slate-500">Real-time status of company vehicles outside the facility</p>
              </div>

              <button
                type="button"
                onClick={() => handleExportCsv('vehicles')}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Export Trip Log CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTrips.length === 0 ? (
                <div className="col-span-full p-8 rounded-3xl bg-white border border-sky-100 text-center text-slate-400 shadow-sm">
                  All organizational vehicles are currently parked and secured inside the facility compound.
                </div>
              ) : (
                activeTrips.map((trip) => (
                  <div 
                    key={trip.id} 
                    onClick={() => onSelectTripForDetails && onSelectTripForDetails(trip)}
                    className="p-5 rounded-3xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 hover:shadow-md transition-all space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-700 text-sm">
                        {trip.fleetNumber} ({trip.plateNumber})
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        IN TRANSIT
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-900 font-bold">Driver: {trip.driverName}</p>
                      <p className="text-slate-500">Destination: <span className="text-slate-800 font-medium">{trip.destination}</span></p>
                      <p className="text-slate-500">Purpose: {trip.purpose}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                      <span>Departed: {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Odo: {trip.departureOdometer.toLocaleString()} km</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY OFFICERS' ACTIVITY */}
        {activeTab === 'officer-activity' && (
          <div className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Gate Guard Activity Feed</h2>
              <p className="text-xs text-slate-500">Real-time log of security officer clearance actions and gate transactions</p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.filter(l => l.action.includes('CHECK_IN') || l.action.includes('CHECK_OUT') || l.action.includes('LOGIN')).slice(0, 25).map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center font-bold text-sky-600 shrink-0">
                      👮
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{log.officerName}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Station: {log.gate}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INVESTIGATION & FLAGS */}
        {activeTab === 'investigate' && (
          <div className="space-y-6">
            {/* Overdue Visitors to Investigate */}
            <div className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Overdue Visitors Requiring Clearance Check ({overdueVisitors.length})</span>
              </h3>
              {overdueVisitors.length === 0 ? (
                <p className="text-xs text-slate-400">Zero visitors currently overdue in the compound.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {overdueVisitors.map((pass) => (
                    <div key={pass.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{pass.visitorName}</span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">OVERDUE</span>
                      </div>
                      <p className="text-slate-600">Visiting Host: <span className="text-slate-900 font-medium">{pass.hostName} ({pass.hostDepartment})</span></p>
                      <p className="text-slate-500 font-mono text-[11px]">Badge: {pass.badgeNumber}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flagged Vehicles to Review */}
            <div className="bg-white rounded-3xl border border-rose-200 p-5 sm:p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Vehicle Inspection Flags & Condition Discrepancies ({flaggedTrips.length})</span>
              </h3>
              {flaggedTrips.length === 0 ? (
                <p className="text-xs text-slate-400">No abnormal vehicle damage or fuel discrepancies reported.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flaggedTrips.map((trip) => (
                    <div key={trip.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-1 text-xs">
                      <p className="font-bold text-slate-900">{trip.fleetNumber} - Driver: {trip.driverName}</p>
                      <p className="text-slate-600">Destination: {trip.destination}</p>
                      <p className="text-rose-700 font-medium">Return Note: {trip.tripNotes || trip.returnChecklist?.remarks || 'Condition flag noted.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTS GENERATOR */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Department Movement Reports</h2>
              <p className="text-xs text-slate-500">Generate, review, and export verified movement audit packages</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Comprehensive Visitor Movement Report</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Includes entry/departure timestamps, admitting guard, host department, carried assets, and overdue status.
                </p>
                <button
                  type="button"
                  onClick={() => handleExportCsv('visitors')}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Visitor Log (CSV)</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Fleet Vehicle Transit Report</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Includes driver authorizations, departure/return odometers, checklist flags, and fuel consumption logs.
                </p>
                <button
                  type="button"
                  onClick={() => handleExportCsv('vehicles')}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Fleet Log (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
