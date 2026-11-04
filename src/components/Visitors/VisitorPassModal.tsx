import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  User, 
  Clock, 
  Car, 
  Package, 
  Phone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorPass } from '../../types/visitor';

interface VisitorPassModalProps {
  pass: VisitorPass | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckOut?: (pass: VisitorPass) => void;
}

export const VisitorPassModal: React.FC<VisitorPassModalProps> = ({
  pass,
  isOpen,
  onClose,
  onCheckOut,
}) => {
  const { settings } = useSecurity();

  if (!isOpen || !pass) return null;

  const handlePrint = () => {
    window.print();
  };

  const isOverdue = pass.status === 'OVERDUE';
  const isCheckedOut = pass.status === 'CHECKED_OUT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-4">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Official Visitor Gate Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Pass Body */}
        <div className="p-6 bg-slate-900 text-white printable-card">
          {/* Card Frame */}
          <div className="border border-slate-700 rounded-xl p-5 bg-slate-950/60 relative overflow-hidden">
            {/* Top Security Banner */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  {settings.facilityName}
                </p>
                <h1 className="text-base font-bold text-white tracking-tight mt-0.5">
                  VISITOR IDENTIFICATION PASS
                </h1>
                <p className="text-[10px] text-slate-400">
                  {pass.entryGate} · Security Post Clearance
                </p>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    isCheckedOut
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : isOverdue
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {pass.status === 'ON_SITE' ? 'ACTIVE VISITOR' : pass.status}
                </span>
                <p className="text-[11px] font-mono text-slate-300 mt-1 font-bold">
                  {pass.badgeNumber}
                </p>
              </div>
            </div>

            {/* Middle Section: Photo & Details & QR */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Photo & QR Column */}
              <div className="flex flex-col items-center text-center space-y-2">
                {pass.photoUrl ? (
                  <img
                    src={pass.photoUrl}
                    alt={pass.visitorName}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-slate-700 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-2xl text-slate-300">
                    {pass.visitorName.charAt(0)}
                  </div>
                )}

                {/* QR Code */}
                {pass.qrCodeDataUrl ? (
                  <div className="bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
                    <img
                      src={pass.qrCodeDataUrl}
                      alt="Verification QR"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600">
                    <QrCode className="w-8 h-8" />
                  </div>
                )}
                <span className="text-[9px] font-mono text-slate-400">Scan at Security</span>
              </div>

              {/* Details Column */}
              <div className="col-span-2 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Visitor Full Name
                  </span>
                  <p className="text-sm font-bold text-white">{pass.visitorName}</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {pass.visitorCompany}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      ID Document
                    </span>
                    <p className="font-mono text-slate-200">
                      {pass.idType}
                    </p>
                    <p className="font-mono font-medium text-emerald-400 text-[11px]">
                      {pass.idNumber}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Phone
                    </span>
                    <p className="font-mono text-slate-300">{pass.visitorPhone}</p>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Host Person
                    </span>
                    <p className="font-semibold text-white">{pass.hostName}</p>
                    <p className="text-[10px] text-slate-400">{pass.hostDepartment}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Purpose
                    </span>
                    <p className="text-slate-200">{pass.purpose}</p>
                  </div>
                </div>

                {pass.vehiclePlate && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>Plate: <strong>{pass.vehiclePlate}</strong></span>
                    {pass.parkingBay && <span>· Bay: <strong>{pass.parkingBay}</strong></span>}
                  </div>
                )}
              </div>
            </div>

            {/* Assets Logged */}
            {pass.assetsCarried && pass.assetsCarried.length > 0 && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Registered Assets / Tools Carried:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pass.assetsCarried.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700"
                    >
                      {a.item} {a.serialNumber ? `(S/N: ${a.serialNumber})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps Bar */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400 mb-3">
              <div>
                <span className="text-slate-500 block text-[9px]">CHECKED IN AT</span>
                <span className="text-slate-200">{new Date(pass.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-slate-500 block text-[9px]">{new Date(pass.entryTime).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">
                  {isCheckedOut ? 'CHECKED OUT AT' : 'EXPECTED DEPARTURE'}
                </span>
                <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {isCheckedOut && pass.actualDepartureTime
                    ? new Date(pass.actualDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date(pass.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-slate-500 block text-[9px]">
                  Officer: {pass.officerCheckInName}
                </span>
              </div>
            </div>

            {/* Barcode graphic footer */}
            <div className="border-t border-slate-800 pt-3 text-center">
              <div className="flex justify-center items-center h-8 gap-0.5 opacity-80 px-4">
                {/* SVG-like Barcode lines */}
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-slate-300 h-full ${
                      i % 7 === 0 ? 'w-1.5' : i % 3 === 0 ? 'w-1' : 'w-0.5'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                *{pass.badgeNumber}*
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Wear pass visibly at all times. Surrender to security guard post upon departure.
              </p>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="no-print px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Emergency desk: <span className="font-mono text-slate-300">{settings.securityOfficePhone}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isCheckedOut && onCheckOut && (
              <button
                onClick={() => {
                  onCheckOut(pass);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Check Out Visitor
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
