import React, { useState } from 'react';
import { 
  X, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Package, 
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass, CarriedAsset } from '../../types/visitor';

interface VisitorCheckOutModalProps {
  pass: VisitorPass | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VisitorCheckOutModal: React.FC<VisitorCheckOutModalProps> = ({
  pass,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { checkOutVisitor, activeGate } = useSecurity();
  const [notes, setNotes] = useState('');
  const [assets, setAssets] = useState<CarriedAsset[]>(pass?.assetsCarried || []);

  if (!isOpen || !pass) return null;

  // Calculate dwell time
  const entryDate = new Date(pass.entryTime);
  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now.getTime() - entryDate.getTime()) / 60000));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const dwellString = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

  const isOverdue = pass.status === 'OVERDUE' || now > new Date(pass.expectedDepartureTime);

  const toggleAssetCheck = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, verifiedOnExit: !a.verifiedOnExit } : a))
    );
  };

  const handleConfirmCheckOut = () => {
    checkOutVisitor(pass.id, notes.trim() || undefined, assets);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Visitor Check-Out & Badge Release
              </h2>
              <p className="text-xs text-slate-400">
                Record departure timestamp and verify carried assets
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Visitor Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pass.photoUrl ? (
                <img
                  src={pass.photoUrl}
                  alt={pass.visitorName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-600 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-lg shrink-0">
                  {pass.visitorName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">{pass.visitorName}</p>
                <p className="text-xs text-slate-400">
                  {pass.visitorCompany} · Host: {pass.hostName} ({pass.hostDepartment})
                </p>
                <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                  Badge: {pass.badgeNumber}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Dwell</span>
              <span className="text-sm font-bold font-mono text-white">{dwellString}</span>
            </div>
          </div>

          {isOverdue && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 flex items-center gap-2.5 text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Overdue Visit:</strong> Expected departure was{' '}
                {new Date(pass.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </span>
            </div>
          )}

          {/* Asset verification checklist */}
          {pass.assetsCarried && pass.assetsCarried.length > 0 && (
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  Asset Inspection (Outbound Inspection)
                </span>
                <span className="text-[11px] text-slate-400">
                  Verify items logged upon entry
                </span>
              </div>

              <div className="space-y-1.5">
                {assets.map((asset) => (
                  <label
                    key={asset.id}
                    onClick={() => toggleAssetCheck(asset.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      asset.verifiedOnExit
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-medium">{asset.item}</span>
                      {asset.serialNumber && (
                        <span className="ml-2 font-mono text-[11px] text-slate-400">
                          (S/N: {asset.serialNumber})
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={!!asset.verifiedOnExit}
                      readOnly
                      className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Departure Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Departure Gate</span>
              <p className="font-semibold text-white mt-0.5">{activeGate.name}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Departure Time</span>
              <p className="font-mono text-emerald-400 font-semibold mt-0.5">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Officer Departure Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Visitor badge returned. No discrepancies observed."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmCheckOut}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirm Departure & Release</span>
          </button>
        </div>
      </div>
    </div>
  );
};
