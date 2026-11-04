import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

interface GatekeeperLoginPageProps {
  onLoginSuccess: () => void;
}

export const GatekeeperLoginPage: React.FC<GatekeeperLoginPageProps> = ({ onLoginSuccess }) => {
  const { officers, switchOfficer, settings } = useSecurity();

  const [staffIdInput, setStaffIdInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const inputClean = staffIdInput.trim().toLowerCase();
    const pinClean = pinInput.trim();

    if (!inputClean) {
      setErrorMsg('Please enter your Staff ID, Badge Number, or Email.');
      return;
    }

    if (!pinClean) {
      setErrorMsg('Please enter your Security PIN or Password.');
      return;
    }

    // Find officer by staff ID (badgeNumber), email, or name
    const officer = officers.find(
      (o) =>
        o.badgeNumber.toLowerCase() === inputClean ||
        (o.email && o.email.toLowerCase() === inputClean) ||
        o.name.toLowerCase() === inputClean
    );

    if (!officer) {
      setErrorMsg('User not found. Please enter a valid Staff ID or Badge Number.');
      return;
    }

    if (!officer.active) {
      setErrorMsg('This account is currently deactivated. Please contact your System Administrator.');
      return;
    }

    // Authenticate with PIN / Password
    const success = switchOfficer(officer.id, pinClean);
    if (success) {
      onLoginSuccess();
    } else {
      setErrorMsg('Incorrect Security PIN / Password. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-[#e3f2fd] via-[#eef7ff] to-[#e1f0fe] flex flex-col justify-center items-center p-4 sm:p-6 font-sans select-none safe-pt safe-pb">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border border-sky-100 p-6 sm:p-8 space-y-6 transition-all">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {settings.organizationName || 'SECUREGATE'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Security Check-In & Check-Out Management System
            </p>
          </div>
        </div>

        {/* Minimal Login Form: ID and Password fields only */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Staff ID / Badge Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={staffIdInput}
                onChange={(e) => {
                  setStaffIdInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter your ID (e.g. 129)"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-sky-500 transition-all font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Security PIN / Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter your PIN / Password"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-sky-500 transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
          >
            <span>Log In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Note / Footer */}
        <p className="text-[11px] text-center text-slate-400 pt-2 border-t border-slate-100">
          Authorized personnel only. Access is monitored and logged.
        </p>
      </div>
    </div>
  );
};
