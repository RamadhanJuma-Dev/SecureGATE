import React from 'react';
import { 
  X, 
  Flame, 
  AlertTriangle, 
  Printer, 
  CheckCircle2, 
  Phone, 
  User, 
  ShieldAlert, 
  Radio,
  RotateCcw
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

interface EvacuationMusterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvacuationMusterModal: React.FC<EvacuationMusterModalProps> = ({ isOpen, onClose }) => {
  const { 
    visitorPasses, 
    emergencyAlarmActive, 
    setEmergencyAlarmActive,
    accountedMusterList,
    toggleMusterAccounted,
    resetMusterRoll,
    settings,
    addAuditLog
  } = useSecurity();

  if (!isOpen) return null;

  // Souls on site = all active visitors
  const onSitePasses = visitorPasses.filter(
    (p) => p.status === 'ON_SITE' || p.status === 'OVERDUE'
  );

  const totalSouls = onSitePasses.length;
  const accountedCount = onSitePasses.filter((p) => accountedMusterList.has(p.id)).length;
  const unaccountedCount = totalSouls - accountedCount;

  const handleToggleAlarm = () => {
    const nextState = !emergencyAlarmActive;
    setEmergencyAlarmActive(nextState);
    addAuditLog(
      'EMERGENCY_MUSTER_INITIATED',
      'SECURITY',
      `EMERGENCY EVACUATION MUSTER ${nextState ? 'ACTIVATED' : 'RESOLVED/SILENCED'}. Headcount souls: ${totalSouls}`,
      nextState ? 'ALERT' : 'NOTICE'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          emergencyAlarmActive ? 'bg-rose-950 border-rose-800' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              emergencyAlarmActive
                ? 'bg-rose-600 text-white animate-bounce'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Emergency Evacuation Muster Roll Call
              </h2>
              <p className="text-xs text-rose-300">
                Live on-premise headcount for fire marshals & incident commanders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Muster Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Headcount Scoreboard */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">TOTAL ON-SITE</span>
            <span className="text-2xl font-bold font-mono text-white">{totalSouls}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900 text-emerald-300">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block">ACCOUNTED / SAFE</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{accountedCount}</span>
          </div>

          <div className={`p-2.5 rounded-xl border ${
            unaccountedCount > 0 ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <span className="text-[10px] font-mono uppercase text-rose-400 block">UNACCOUNTED</span>
            <span className="text-2xl font-bold font-mono text-rose-400">{unaccountedCount}</span>
          </div>
        </div>

        {/* List of Persons on Site */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 printable-card">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Roll Call Roster ({onSitePasses.length} visitors registered inside complex)</span>
            <button
              onClick={resetMusterRoll}
              className="no-print text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Checkmarks</span>
            </button>
          </div>

          {onSitePasses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              All visitors have departed the facility. 0 external personnel on-premise.
            </div>
          ) : (
            onSitePasses.map((pass) => {
              const isAccounted = accountedMusterList.has(pass.id);

              return (
                <div
                  key={pass.id}
                  onClick={() => toggleMusterAccounted(pass.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isAccounted
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isAccounted}
                      readOnly
                      className="rounded border-slate-600 bg-slate-900 text-emerald-500 w-4 h-4 cursor-pointer"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{pass.visitorName}</span>
                        <span className="font-mono text-[11px] text-emerald-400">{pass.badgeNumber}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {pass.visitorCompany} · Host: <strong className="text-slate-200">{pass.hostName}</strong> ({pass.hostDepartment})
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {pass.visitorPhone}
                        </span>
                        {pass.vehiclePlate && <span>Plate: {pass.vehiclePlate}</span>}
                        <span>Entry Gate: {pass.entryGate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isAccounted
                        ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {isAccounted ? 'ACCOUNTED' : 'UNACCOUNTED'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="no-print px-6 py-3.5 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            onClick={handleToggleAlarm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              emergencyAlarmActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 animate-pulse'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{emergencyAlarmActive ? 'Silence Evacuation Alarm' : 'Sound Facility Evacuation Alarm'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Close Muster Roll
          </button>
        </div>
      </div>
    </div>
  );
};
