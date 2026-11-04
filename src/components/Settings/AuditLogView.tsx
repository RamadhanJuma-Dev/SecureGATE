import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  Download
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useSecurity } from '../../context/SecurityContext';
import { AuditSeverity } from '../../types/audit';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useSecurity();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AuditSeverity>('ALL');
  const [targetFilter, setTargetFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, severityFilter, targetFilter]);

  const filtered = auditLogs.filter((log) => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (targetFilter !== 'ALL' && log.targetType !== targetFilter) return false;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      const match =
        log.details.toLowerCase().includes(q) ||
        log.officerName.toLowerCase().includes(q) ||
        log.gate.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filtered.slice(startIndex, startIndex + pageSize);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Officer ID', 'Officer Name', 'Gate', 'Action', 'Target Type', 'Severity', 'Details'];
    const rows = filtered.map((l) => [
      l.timestamp,
      l.officerId,
      `"${l.officerName}"`,
      `"${l.gate}"`,
      l.action,
      l.targetType,
      l.severity,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `security-audit-trail-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Security Audit Trail & Integrity Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable operational event ledger for compliance, accountability, and chain-of-custody tracking
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              severityFilter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Events ({auditLogs.length})
          </button>
          <button
            onClick={() => setSeverityFilter('ALERT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              severityFilter === 'ALERT'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setSeverityFilter('WARNING')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              severityFilter === 'WARNING'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setSeverityFilter('INFO')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              severityFilter === 'INFO' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Informational
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officer, details, action, gate..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 tracking-wider uppercase font-mono">
              <tr>
                <th className="py-2.5 px-4 font-medium">TIMESTAMP</th>
                <th className="py-2.5 px-4 font-medium">SEVERITY</th>
                <th className="py-2.5 px-4 font-medium">ACTION</th>
                <th className="py-2.5 px-4 font-medium">OFFICER / TERMINAL</th>
                <th className="py-2.5 px-4 font-medium">EVENT DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No audit log records match filter</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isAlert = log.severity === 'ALERT';
                  const isWarning = log.severity === 'WARNING';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        <p className="text-slate-200">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isAlert
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : isWarning
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isAlert ? <AlertTriangle className="w-3 h-3" /> : isWarning ? <Clock className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                          {log.severity}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-white whitespace-nowrap">
                        {log.action}
                      </td>

                      {/* Officer & Gate */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        <p className="font-semibold">{log.officerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          {log.gate}
                        </p>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-slate-200">
                        <p className={isAlert ? 'text-rose-300 font-medium' : isWarning ? 'text-amber-200 font-medium' : ''}>
                          {log.details}
                        </p>
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
