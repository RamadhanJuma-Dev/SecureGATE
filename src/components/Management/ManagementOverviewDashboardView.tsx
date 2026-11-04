import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Truck, 
  Download, 
  Search, 
  FileText,
  BarChart3,
  LogOut,
  Lock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

interface ManagementOverviewDashboardViewProps {
  onLogout: () => void;
}

export const ManagementOverviewDashboardView: React.FC<ManagementOverviewDashboardViewProps> = ({
  onLogout,
}) => {
  const {
    currentOfficer,
    visitorPasses,
    vehicles,
    trips,
    settings,
  } = useSecurity();

  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'fleet' | 'reports'>('overview');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [fleetSearch, setFleetSearch] = useState('');

  // Computations for Executive KPIs
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const totalVisitorsToday = visitorPasses.filter(
    (p) => new Date(p.entryTime) >= todayStart
  ).length;

  const currentOnSite = visitorPasses.filter(
    (p) => p.status === 'ON_SITE' || p.status === 'OVERDUE'
  ).length;

  const activeTripsCount = trips.filter((t) => t.status === 'ACTIVE').length;
  const fleetUtilizationRate = vehicles.length > 0 
    ? Math.round((activeTripsCount / vehicles.length) * 100) 
    : 0;

  // Department distribution
  const departmentCounts: Record<string, number> = {};
  visitorPasses.forEach((p) => {
    const dept = p.hostDepartment || 'General';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  // Purpose distribution
  const purposeCounts: Record<string, number> = {};
  visitorPasses.forEach((p) => {
    const purpose = p.purpose || 'Official Business';
    purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
  });

  // Filtered passes for historical table
  const filteredPasses = visitorPasses.filter((p) => {
    if (!visitorSearch.trim()) return true;
    const q = visitorSearch.toLowerCase();
    return (
      p.visitorName.toLowerCase().includes(q) ||
      p.visitorCompany.toLowerCase().includes(q) ||
      p.hostName.toLowerCase().includes(q) ||
      p.hostDepartment.toLowerCase().includes(q) ||
      p.badgeNumber.toLowerCase().includes(q)
    );
  });

  // Filtered trips for fleet historical table
  const filteredTrips = trips.filter((t) => {
    if (!fleetSearch.trim()) return true;
    const q = fleetSearch.toLowerCase();
    return (
      t.fleetNumber.toLowerCase().includes(q) ||
      t.plateNumber.toLowerCase().includes(q) ||
      t.driverName.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q)
    );
  });

  const handleExportManagementReport = (type: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'visitor-intelligence') {
      csvContent += 'Badge Number,Visitor Name,Organization,Host Name,Department,Purpose,Entry Time,Departure Time,Status\n';
      visitorPasses.forEach((p) => {
        csvContent += `"${p.badgeNumber}","${p.visitorName}","${p.visitorCompany}","${p.hostName}","${p.hostDepartment}","${p.purpose}","${p.entryTime}","${p.actualDepartureTime || 'On-Site'}","${p.status}"\n`;
      });
    } else {
      csvContent += 'Trip ID,Fleet Number,Plate Number,Authorized Driver,Destination,Departure Time,Return Time,Departure Mileage,Return Mileage,Status\n';
      trips.forEach((t) => {
        csvContent += `"${t.tripPassNumber}","${t.fleetNumber}","${t.plateNumber}","${t.driverName}","${t.destination}","${t.departureTime}","${t.actualReturnTime || 'In Transit'}","${t.departureOdometer}","${t.returnOdometer || 'N/A'}","${t.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Executive_Security_${type}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initials = currentOfficer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SA';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] via-[#edf6fd] to-[#e0f0fe] py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 font-sans text-slate-800 select-none">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Executive Profile Card (Unified with Gatekeeper style) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-sky-100 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {currentOfficer.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 tracking-wide uppercase flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>MANAGEMENT (READ-ONLY)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 tracking-wide uppercase hidden sm:inline-block">
                  {settings.organizationShortName || settings.organizationName || 'SECUREGATE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Executive ID: {currentOfficer.badgeNumber} • Security Statistics & Organizational Intelligence
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

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1: Today's Total Entries */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Today's Total Entries
              </span>
              <div className="w-10 h-10 rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {totalVisitorsToday}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Compound ingress traffic today
              </p>
            </div>
            <div className="pt-2 text-xs text-slate-500 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
              <span>Real-time visitor registrations</span>
            </div>
          </div>

          {/* KPI 2: Active Campus Presence */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Active Campus Presence
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tracking-tight tabular-nums">
                {currentOnSite}
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Authorized persons currently on-site
              </p>
            </div>
            <div className="pt-2 text-xs text-emerald-600 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Compound occupancy headcount</span>
            </div>
          </div>

          {/* KPI 3: Fleet Utilization */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Fleet Utilization
              </span>
              <div className="w-10 h-10 rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {fleetUtilizationRate}%
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {activeTripsCount} of {vehicles.length} vehicles deployed
              </p>
            </div>
            <div className="pt-2 text-xs text-slate-500 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <span className="text-sky-600 font-bold">{vehicles.length - activeTripsCount} ready</span>
              <span>at facility parking</span>
            </div>
          </div>

          {/* KPI 4: Security Inductions */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 space-y-2 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Security Compliance
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                100%
              </span>
              <p className="text-xs text-slate-400 font-medium mt-1">
                ID verification & pass enforcement
              </p>
            </div>
            <div className="pt-2 text-xs text-purple-700 font-medium flex items-center gap-1.5 border-t border-slate-100">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>Full policy adherence</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Pill style matching uniform aesthetic) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Executive Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visitors')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'visitors'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Historical Visitor Records</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-slate-900 border border-sky-100 font-semibold shadow-xs'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Fleet Movement Archive</span>
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
            <span>Authorized Report Export</span>
          </button>
        </div>

        {/* TAB 1: EXECUTIVE ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Department Breakdown */}
            <div className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Visitor Traffic by Department</h3>
                <span className="text-xs text-slate-400 font-normal">Department load distribution</span>
              </div>

              <div className="space-y-3">
                {Object.entries(departmentCounts).map(([dept, count]) => {
                  const pct = Math.round((count / (visitorPasses.length || 1)) * 100);
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{dept}</span>
                        <span className="text-sky-700 font-mono">{count} visits ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visit Purpose Breakdown */}
            <div className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Ingress Purpose Classification</h3>
                <span className="text-xs text-slate-400 font-normal">Operational categorization</span>
              </div>

              <div className="space-y-3">
                {Object.entries(purposeCounts).map(([purpose, count]) => {
                  const pct = Math.round((count / (visitorPasses.length || 1)) * 100);
                  return (
                    <div key={purpose} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{purpose}</span>
                        <span className="text-indigo-600 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORICAL VISITOR RECORDS */}
        {activeTab === 'visitors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  placeholder="Search historical visitor database..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                />
              </div>

              <span className="text-xs text-slate-500 font-mono">
                {filteredPasses.length} total recorded entries
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50/70 text-slate-600 font-semibold border-b border-sky-100">
                    <tr>
                      <th className="px-5 py-3.5">Badge</th>
                      <th className="px-4 py-3.5">Visitor</th>
                      <th className="px-4 py-3.5">Host & Dept</th>
                      <th className="px-4 py-3.5">Entry Date & Time</th>
                      <th className="px-4 py-3.5">Departure</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100/60 font-medium">
                    {filteredPasses.map((pass) => (
                      <tr key={pass.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-sky-700 font-bold">
                          {pass.badgeNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{pass.visitorName}</p>
                          <p className="text-[11px] text-slate-500">{pass.visitorCompany}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-slate-800 font-semibold">{pass.hostName}</p>
                          <p className="text-[11px] text-slate-500">{pass.hostDepartment}</p>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700">
                          {new Date(pass.entryTime).toLocaleDateString()} {new Date(pass.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-500">
                          {pass.actualDepartureTime ? new Date(pass.actualDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still on premise'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            pass.status === 'ON_SITE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            pass.status === 'OVERDUE' ? 'bg-amber-50 text-amber-700 border border-amber-200 font-extrabold' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {pass.status === 'ON_SITE' ? '✓ On-Site' : pass.status === 'OVERDUE' ? '⚠ Overdue' : '✗ Departed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FLEET MOVEMENT ARCHIVE */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-sky-100 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fleetSearch}
                  onChange={(e) => setFleetSearch(e.target.value)}
                  placeholder="Search fleet vehicle trip records..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 font-medium"
                />
              </div>

              <span className="text-xs text-slate-500 font-mono">
                {filteredTrips.length} recorded dispatch trips
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50/70 text-slate-600 font-semibold border-b border-sky-100">
                    <tr>
                      <th className="px-5 py-3.5">Vehicle</th>
                      <th className="px-4 py-3.5">Driver</th>
                      <th className="px-4 py-3.5">Destination & Purpose</th>
                      <th className="px-4 py-3.5">Departed</th>
                      <th className="px-4 py-3.5">Mileage (Out → In)</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100/60 font-medium">
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono">
                          <p className="font-bold text-sky-700">{trip.fleetNumber}</p>
                          <p className="text-[11px] text-slate-500">{trip.plateNumber}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-900 font-semibold">
                          {trip.driverName}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-slate-800 font-medium">{trip.destination}</p>
                          <p className="text-[11px] text-slate-500">{trip.purpose}</p>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700">
                          {new Date(trip.departureTime).toLocaleDateString()} {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600">
                          {trip.departureOdometer.toLocaleString()} km → {trip.returnOdometer ? `${trip.returnOdometer.toLocaleString()} km` : 'In transit'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            trip.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTHORIZED REPORT EXPORT */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Authorized Executive Intelligence Exports</h2>
              <p className="text-xs text-slate-500">Download verified movement records and organizational metrics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Executive Visitor Influx Summary</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive audit of visitor visits, company breakdown, host departments, and duration metrics.
                </p>
                <button
                  type="button"
                  onClick={() => handleExportManagementReport('visitor-intelligence')}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-600/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Visitor Brief (CSV)</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Fleet Utilization & Mobility Audit</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed mileage logs, trip frequencies per vehicle, driver assignments, and fuel consumption trends.
                </p>
                <button
                  type="button"
                  onClick={() => handleExportManagementReport('fleet-mobility')}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-600/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Fleet Brief (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
