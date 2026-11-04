import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Search, 
  UserCheck, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass } from '../../types/visitor';
import { VehicleTrip } from '../../types/vehicle';

interface GateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassForBadge: (pass: VisitorPass) => void;
  onSelectPassForCheckOut: (pass: VisitorPass) => void;
  onSelectTripForReturn: (trip: VehicleTrip) => void;
}

export const GateScannerModal: React.FC<GateScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectPassForBadge,
  onSelectPassForCheckOut,
  onSelectTripForReturn,
}) => {
  const { visitorPasses, trips, visitorProfiles, activeGate } = useSecurity();
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [resultType, setResultType] = useState<'VISITOR' | 'VEHICLE_TRIP' | 'PROFILE' | 'NOT_FOUND' | null>(null);

  if (!isOpen) return null;

  const handleScanOrSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setScanResult(null);
      setResultType(null);
      return;
    }

    // 1. Check visitor passes
    const matchedPass = visitorPasses.find(
      (p) =>
        p.badgeNumber.toLowerCase() === q ||
        p.id.toLowerCase() === q ||
        p.idNumber.toLowerCase() === q ||
        (p.vehiclePlate && p.vehiclePlate.toLowerCase() === q)
    );

    if (matchedPass) {
      setScanResult(matchedPass);
      setResultType('VISITOR');
      return;
    }

    // 2. Check vehicle trips
    const matchedTrip = trips.find(
      (t) =>
        t.tripPassNumber.toLowerCase() === q ||
        t.fleetNumber.toLowerCase() === q ||
        t.plateNumber.toLowerCase() === q
    );

    if (matchedTrip) {
      setScanResult(matchedTrip);
      setResultType('VEHICLE_TRIP');
      return;
    }

    // 3. Check visitor profiles (returning identity)
    const matchedProfile = visitorProfiles.find(
      (pr) =>
        pr.idNumber.toLowerCase() === q ||
        pr.phoneNumber.toLowerCase() === q ||
        (pr.defaultVehiclePlate && pr.defaultVehiclePlate.toLowerCase() === q)
    );

    if (matchedProfile) {
      setScanResult(matchedProfile);
      setResultType('PROFILE');
      return;
    }

    setScanResult(null);
    setResultType('NOT_FOUND');
  };

  const handleQuickChipClick = (code: string) => {
    setScanInput(code);
    handleScanOrSearch(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Gate Pass Barcode & QR Scanner Terminal
              </h2>
              <p className="text-xs text-slate-400">
                Scan optical barcode or input badge number for instant verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Simulation Input */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                OPTICAL READER READY
              </span>
              <span className="font-mono text-[11px]">POST: {activeGate.name}</span>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={scanInput}
                onChange={(e) => {
                  setScanInput(e.target.value);
                  handleScanOrSearch(e.target.value);
                }}
                placeholder="Scan badge QR/Barcode or enter badge ID / plate..."
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-800 border-2 border-emerald-500/50 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-400"
              />
              <QrCode className="w-5 h-5 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick Demo Scanning Presets */}
            <div className="pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5">
                Simulate Scans on Active Demo Passes:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickChipClick('VIS-2026-0142')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700"
                >
                  VIS-2026-0142 (Maya Lin)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickChipClick('VIS-2026-0139')}
                  className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-mono text-[11px] border border-rose-800"
                >
                  VIS-2026-0139 (Overdue)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickChipClick('TRIP-2026-0312')}
                  className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-mono text-[11px] border border-amber-800"
                >
                  TRIP-2026-0312 (VAN-02)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickChipClick('ID-1092837')}
                  className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white font-mono text-[11px] border border-rose-700"
                >
                  ID-1092837 (Watchlist)
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {resultType === 'VISITOR' && scanResult && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                    VISITOR GATE PASS VERIFIED
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {scanResult.visitorName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {scanResult.visitorCompany} · Visiting {scanResult.hostName} ({scanResult.hostDepartment})
                  </p>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    scanResult.status === 'OVERDUE'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      : scanResult.status === 'CHECKED_OUT'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {scanResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 p-2.5 rounded-lg bg-slate-900">
                <div>
                  <span className="text-slate-500 text-[10px] block">BADGE ID</span>
                  <span>{scanResult.badgeNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ENTRY TIME</span>
                  <span>{new Date(scanResult.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/80">
                <button
                  onClick={() => {
                    onSelectPassForBadge(scanResult);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium"
                >
                  View Badge Details
                </button>
                {scanResult.status !== 'CHECKED_OUT' && (
                  <button
                    onClick={() => {
                      onSelectPassForCheckOut(scanResult);
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out Visitor</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {resultType === 'VEHICLE_TRIP' && scanResult && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 block font-semibold">
                    FLEET TRIP CLEARANCE VERIFIED
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {scanResult.fleetNumber} ({scanResult.plateNumber})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Driver: {scanResult.driverName} · Dest: {scanResult.destination}
                  </p>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {scanResult.status}
                </span>
              </div>

              {scanResult.status === 'ACTIVE' && (
                <div className="flex justify-end pt-2 border-t border-slate-700/80">
                  <button
                    onClick={() => {
                      onSelectTripForReturn(scanResult);
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Process Vehicle Check-In</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {resultType === 'PROFILE' && scanResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              scanResult.isWatchlisted ? 'bg-rose-950/60 border-rose-800' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-mono uppercase block font-semibold ${
                    scanResult.isWatchlisted ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {scanResult.isWatchlisted ? 'SECURITY WATCHLIST MATCH!' : 'REGISTERED RETURNING VISITOR'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {scanResult.fullName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {scanResult.company} · ID: {scanResult.idNumber}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {scanResult.totalVisits} Prior Visits
                </span>
              </div>

              {scanResult.isWatchlisted && (
                <div className="p-2.5 rounded bg-rose-950 border border-rose-800 text-rose-200 text-xs">
                  <strong>WATCHLIST WARNING:</strong> {scanResult.watchlistReason}
                </div>
              )}
            </div>
          )}

          {resultType === 'NOT_FOUND' && (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
              No active pass, trip, or visitor profile found matching "{scanInput}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Connected to high-speed optical barcode decoder</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
