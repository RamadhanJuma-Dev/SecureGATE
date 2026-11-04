import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  QrCode, 
  AlertTriangle, 
  ChevronDown, 
  MapPin, 
  UserCheck, 
  LogOut,
  Radio
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenEvacuation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanner, onOpenEvacuation }) => {
  const { 
    currentOfficer, 
    activeGate, 
    settings, 
    switchGate, 
    lockTerminal,
    emergencyAlarmActive,
    visitorPasses,
    trips
  } = useSecurity();

  const [gateDropdownOpen, setGateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Calculate live on-site visitors count
  const onSiteVisitors = visitorPasses.filter(
    (p) => p.status === 'ON_SITE' || p.status === 'OVERDUE'
  ).length;

  const activeTripsCount = trips.filter((t) => t.status === 'ACTIVE').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Zone 1: Wordmark & Brand title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              {settings.organizationName || 'SECUREGATE'}
            </span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              SECURITY OS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[200px] hidden sm:block">
            {settings.facilityName}
          </p>
        </div>
      </div>

      {/* Zone 2: Gate Checkpoint & Live Status Bar */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        {/* Gate Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setGateDropdownOpen(!gateDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium whitespace-nowrap">{activeGate.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {gateDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
                Select Active Security Terminal
              </div>
              {settings.gates.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    switchGate(g.id);
                    setGateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition-colors ${
                    g.id === activeGate.id ? 'text-emerald-400 font-semibold bg-slate-700/30' : 'text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate">{g.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{g.type} checkpoint</p>
                  </div>
                  {g.id === activeGate.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Visitors On-Site:</span>
            <span className="font-mono font-semibold text-white">{onSiteVisitors}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Fleet On Trip:</span>
            <span className="font-mono font-semibold text-white">{activeTripsCount}</span>
          </div>
        </div>
      </div>

      {/* Zone 3: Operational Quick Actions & Guard Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Pass Scanner Button */}
        <button
          onClick={onOpenScanner}
          title="Scan Visitor Badge or Vehicle Trip Slip"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Pass Scanner</span>
        </button>

        {/* Emergency Evacuation Muster Button */}
        <button
          onClick={onOpenEvacuation}
          title="Emergency Evacuation Muster Headcount"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            emergencyAlarmActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 animate-pulse'
              : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-900/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Muster Roll</span>
        </button>

        {/* Officer Profile & Lock */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setGateDropdownOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-300">
              {currentOfficer.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold leading-tight truncate max-w-[110px]">{currentOfficer.name}</p>
              <p className="text-[10px] font-mono text-slate-400">{currentOfficer.badgeNumber}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50">
              <div className="px-3 pb-2 border-b border-slate-700/60">
                <p className="text-xs font-bold text-white">{currentOfficer.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-emerald-400">{currentOfficer.badgeNumber}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                    {currentOfficer.role}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    lockTerminal();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-slate-700/60 flex items-center gap-2 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Terminal / Switch Shift</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Lock Button */}
        <button
          onClick={lockTerminal}
          title="Fast Lock Terminal"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
