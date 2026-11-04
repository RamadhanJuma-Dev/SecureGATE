import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  UserCheck, 
  KeyRound, 
  AlertCircle, 
  MapPin,
  ChevronDown
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const LockScreenModal: React.FC = () => {
  const { 
    isLocked, 
    currentOfficer, 
    officers, 
    switchOfficer, 
    unlockTerminal, 
    settings, 
    activeGate,
    switchGate,
    getLockoutStatus
  } = useSecurity();

  const [selectedOfficerId, setSelectedOfficerId] = useState(currentOfficer.id);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedGateId, setSelectedGateId] = useState(settings.currentGateId);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  const targetOfficer = officers.find((o) => o.id === selectedOfficerId) || currentOfficer;

  // Check lockout on mount or when switching selected officer
  React.useEffect(() => {
    if (!targetOfficer) return;
    const status = getLockoutStatus(targetOfficer.badgeNumber);
    if (status.isLocked && status.remainingSeconds > 0) {
      setLockoutCountdown(status.remainingSeconds);
      setErrorMsg(`Account temporarily locked out. Try again in ${status.remainingSeconds}s.`);
    } else {
      setLockoutCountdown(0);
    }
  }, [targetOfficer?.badgeNumber, getLockoutStatus]);

  // Lockout countdown timer
  React.useEffect(() => {
    if (lockoutCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        setErrorMsg(`Account temporarily locked out. Try again in ${prev - 1}s.`);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutCountdown]);

  if (!isLocked) return null;

  const isLockedOut = lockoutCountdown > 0;

  const handleDigitClick = (digit: string) => {
    if (isLockedOut) return;
    if (pin.length < 6) {
      setPin(pin + digit);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    if (isLockedOut) return;
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLockedOut) {
      setErrorMsg(`Terminal is locked out. Please wait ${lockoutCountdown}s.`);
      return;
    }

    if (!pin) {
      setErrorMsg('Please enter security clearance PIN.');
      return;
    }

    if (selectedGateId !== settings.currentGateId) {
      switchGate(selectedGateId);
    }

    const success = switchOfficer(selectedOfficerId, pin);
    if (success) {
      setPin('');
      setErrorMsg('');
      setLockoutCountdown(0);
    } else {
      const status = getLockoutStatus(targetOfficer.badgeNumber);
      if (status.isLocked && status.remainingSeconds > 0) {
        setLockoutCountdown(status.remainingSeconds);
        setErrorMsg(`Account locked out for ${status.remainingSeconds}s due to ${status.attempts} failed attempts.`);
      } else {
        setErrorMsg(`Invalid Security PIN. Attempt ${status.attempts} of 5.`);
      }
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-5 animate-fade-in text-center">
        {/* Shield Icon Lock */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
          <Shield className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
            SECURE TERMINAL ACCESS
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight mt-2">
            SECUREGATE Security Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Shift Handover & Access Management Authentication
          </p>
        </div>

        {/* Officer Selection Dropdown */}
        <div className="w-full text-left space-y-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Authorized Security Personnel:
          </label>
          <div className="relative">
            <select
              value={selectedOfficerId}
              onChange={(e) => {
                setSelectedOfficerId(e.target.value);
                setPin('');
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8"
            >
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.role}) · Badge: {o.badgeNumber}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Badge: <strong className="text-white">{targetOfficer.badgeNumber}</strong></span>
            <span>Role: <strong className="text-emerald-400">{targetOfficer.role}</strong></span>
          </div>
        </div>

        {/* Gate Checkpoint Switcher */}
        <div className="w-full text-left space-y-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Gate Checkpoint Station:
          </label>
          <select
            value={selectedGateId}
            onChange={(e) => setSelectedGateId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            {settings.gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* PIN Entry Display */}
        <div className="w-full space-y-2">
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
                    : 'border-slate-600 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}

          <p className="text-[11px] text-slate-400 font-mono">
            Enter authorized security clearance PIN to proceed
          </p>
        </div>

        {/* Numeric Keypad */}
        <div className="w-full grid grid-cols-3 gap-2 max-w-xs">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isLockedOut}
              onClick={() => handleDigitClick(digit)}
              className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-base font-bold transition-all border border-slate-700/80 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={isLockedOut}
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-400 active:scale-95 text-xs font-mono transition-all border border-slate-700/60"
          >
            DEL
          </button>
          <button
            type="button"
            disabled={isLockedOut}
            onClick={() => handleDigitClick('0')}
            className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-mono text-base font-bold transition-all border border-slate-700/80 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLockedOut}
            onClick={() => handleUnlock()}
            className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>ENTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
