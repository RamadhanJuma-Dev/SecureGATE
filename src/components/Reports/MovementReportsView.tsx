import React, { useState } from 'react';
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
import { useSecurity } from '../../context/SecurityContext';

export const MovementReportsView: React.FC = () => {
  const { visitorPasses, trips, settings, exportBackupJson } = useSecurity();

  const [reportType, setReportType] = useState<'ALL' | 'VISITORS' | 'VEHICLES'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Filter visitors
  const filteredVisitors = visitorPasses.filter((p) => {
    if (deptFilter !== 'ALL' && p.hostDepartment !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
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
    if (search.trim()) {
      const q = search.toLowerCase();
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

    const rows = filteredVisitors.map((p) => [
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
      p.status,
      p.vehiclePlate || 'N/A',
      `"${p.officerCheckInName}"`,
      `"${p.officerCheckOutName || 'N/A'}"`,
    ]);

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
      'Vehicle Model',
      'Driver Name',
      'Driver Employee ID',
      'Department',
      'Destination',
      'Purpose',
      'Departure Time',
      'Return Time',
      'Start Odometer',
      'Return Odometer',
      'Distance Traveled (km)',
      'Status',
    ];

    const rows = filteredTrips.map((t) => [
      t.tripPassNumber,
      t.fleetNumber,
      t.plateNumber,
      `"${t.makeModel}"`,
      `"${t.driverName}"`,
      t.driverEmployeeId,
      `"${t.department}"`,
      `"${t.destination}"`,
      `"${t.purpose}"`,
      t.departureTime,
      t.actualReturnTime || 'On Route',
      t.departureOdometer,
      t.returnOdometer || 'N/A',
      t.distanceTraveledKm || 0,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security-fleet-trips-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  // Peak Hours distribution calculation
  const hoursDistribution: Record<number, number> = {};
  visitorPasses.forEach((p) => {
    const hour = new Date(p.entryTime).getHours();
    hoursDistribution[hour] = (hoursDistribution[hour] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Security Movement Reports & Operational Audits
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Retrieve, analyze, and export visitor entries, departures, and organizational vehicle logbooks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportVisitorsCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Visitors CSV</span>
          </button>
          <button
            onClick={handleExportTripsCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Fleet CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Filter Strip (no-print) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Type filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setReportType('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                reportType === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setReportType('VISITORS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                reportType === 'VISITORS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visitors Only ({visitorPasses.length})
            </button>
            <button
              onClick={() => setReportType('VEHICLES')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                reportType === 'VEHICLES' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fleet Movements ({trips.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {settings.companyDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search report records..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Widget (Hour distribution & metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 block font-medium">
            Total Movements Processed
          </span>
          <p className="text-3xl font-bold font-mono text-white tabular-nums">
            {visitorPasses.length + trips.length}
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>{visitorPasses.length} Visitors</span>
            <span>{trips.length} Fleet Trips</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 block font-medium">
            Total Fleet Distance Traveled
          </span>
          <p className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            {trips.reduce((acc, t) => acc + (t.distanceTraveledKm || 0), 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">km</span>
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Logged across all organizational missions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 block font-medium">
            Visitor Compliance Rate
          </span>
          <p className="text-3xl font-bold font-mono text-white tabular-nums">
            {visitorPasses.length > 0
              ? Math.round(((visitorPasses.length - visitorPasses.filter(p => p.status === 'OVERDUE').length) / visitorPasses.length) * 100)
              : 100}%
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Passes checked out within schedule</span>
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="print-only border-b border-black pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase">{settings.facilityName}</h1>
        <p className="text-sm">Official Security Check-In & Check-Out Movement Log Report</p>
        <p className="text-xs">Generated: {new Date().toLocaleString()} · Facility Address: {settings.facilityAddress}</p>
      </div>

      {/* Report Records: Visitor Section */}
      {(reportType === 'ALL' || reportType === 'VISITORS') && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Visitor Entry & Departure Records ({filteredVisitors.length})
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
                {filteredVisitors.map((p) => (
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
                        p.status === 'CHECKED_OUT'
                          ? 'bg-slate-800 text-slate-400'
                          : p.status === 'OVERDUE'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {filteredTrips.map((t) => (
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
                ))}
              </tbody>
            </table>
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
