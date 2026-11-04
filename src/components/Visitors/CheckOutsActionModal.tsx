import React, { useState } from 'react';
import { 
  X, 
  DoorOpen, 
  Search, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Car, 
  User, 
  AlertTriangle 
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass } from '../../types/visitor';

interface CheckOutsActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassForCheckOut: (pass: VisitorPass) => void;
}

export const CheckOutsActionModal: React.FC<CheckOutsActionModalProps> = ({
  isOpen,
  onClose,
  onSelectPassForCheckOut,
}) => {
  const { visitorPasses, checkOutVisitor, activeGate } = useSecurity();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Active guests on premise
  const activePasses = visitorPasses.filter(
    (p) => p.status === 'ON_SITE' || p.status === 'OVERDUE'
  );

  const filtered = activePasses.filter((pass) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      pass.visitorName.toLowerCase().includes(q) ||
      pass.visitorCompany.toLowerCase().includes(q) ||
      pass.badgeNumber.toLowerCase().includes(q) ||
      pass.hostName.toLowerCase().includes(q) ||
      (pass.vehiclePlate && pass.vehiclePlate.toLowerCase().includes(q))
    );
  });

  const handleInstantCheckout = (pass: VisitorPass) => {
    checkOutVisitor(pass.id, 'Standard exit. Badge surrendered.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto safe-pt safe-pb">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl border border-sky-100 flex flex-col max-h-[94dvh] sm:max-h-[90vh] overflow-hidden my-auto text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shadow-sm">
              🚪
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gate Check Outs
              </h2>
              <p className="text-xs text-slate-500">
                Vehicles & Guests Leaving the Compound
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active guest by name, badge, vehicle plate..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1">
            <span>{filtered.length} guests currently on-site</span>
            <span>Terminal: {activeGate.name}</span>
          </div>
        </div>

        {/* List of active visitors to check out */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="font-semibold text-slate-700">No matching active guests on-site</p>
              <p className="text-slate-400 mt-0.5">All registered guests have completed check-out.</p>
            </div>
          ) : (
            filtered.map((pass) => {
              const isOverdue = pass.status === 'OVERDUE';
              const entryTimeStr = new Date(pass.entryTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={pass.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{pass.visitorName}</span>
                      <span className="font-mono text-[10px] text-sky-700 font-semibold px-1.5 py-0.2 rounded bg-sky-50 border border-sky-200">
                        {pass.badgeNumber}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                          Overstay
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {pass.visitorCompany} · Host: <strong className="text-slate-700">{pass.hostName}</strong>
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Entered: {entryTimeStr}</span>
                      {pass.vehiclePlate && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600 font-bold">Car: {pass.vehiclePlate}</span>
                        </>
                      )}
                      {pass.assetsCarried && pass.assetsCarried.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700 font-semibold">{pass.assetsCarried.length} item(s) logged</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Check Out Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSelectPassForCheckOut(pass)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Check Out</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tapping Check Out marks departure and releases pass.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
