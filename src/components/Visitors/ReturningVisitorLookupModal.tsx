import React, { useState } from 'react';
import { 
  Search, 
  X, 
  UserCheck, 
  Building2, 
  Phone, 
  CreditCard, 
  Car, 
  Clock, 
  AlertOctagon, 
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { VisitorProfile, VisitorPass } from '../../types/visitor';

interface ReturningVisitorLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForCheckIn: (profile: VisitorProfile) => void;
}

export const ReturningVisitorLookupModal: React.FC<ReturningVisitorLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectForCheckIn,
}) => {
  const { visitorProfiles, searchVisitors } = useSecurity();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = searchQuery.trim() ? searchVisitors(searchQuery) : visitorProfiles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Returning Visitor Identification Lookup
              </h2>
              <p className="text-xs text-slate-400">
                Instant retrieval by ID number, phone, name, or vehicle plate for expedited check-in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID Number, Phone, Full Name, Company, or License Plate..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span>Quick filters:</span>
            <button
              onClick={() => setSearchQuery('ID-')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
            >
              ID-
            </button>
            <button
              onClick={() => setSearchQuery('DL-')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
            >
              DL-
            </button>
            <button
              onClick={() => setSearchQuery('KCF')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
            >
              Vehicle Plates
            </button>
            <span className="ml-auto text-slate-500">
              Showing {filtered.length} registered profiles
            </span>
          </div>
        </div>

        {/* Visitor Cards Directory */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <UserCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">No matching visitor record found</p>
              <p className="text-xs text-slate-500 mt-1">
                Please verify spelling or register this person as a first-time visitor.
              </p>
            </div>
          ) : (
            filtered.map((profile) => (
              <div
                key={profile.id}
                className={`p-4 rounded-xl border transition-all ${
                  profile.isWatchlisted
                    ? 'bg-rose-950/20 border-rose-800/80 hover:border-rose-600'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-emerald-500/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Visitor Info Column */}
                  <div className="flex items-start gap-3.5">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-700/70 border border-slate-600 flex items-center justify-center font-bold text-slate-300 text-base shrink-0">
                        {profile.fullName.charAt(0)}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{profile.fullName}</span>
                        {profile.vip && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            VIP VISITOR
                          </span>
                        )}
                        {profile.isWatchlisted && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700 flex items-center gap-1 font-semibold">
                            <AlertOctagon className="w-3 h-3" />
                            SECURITY WATCHLIST
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {profile.company}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-300 font-mono">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {profile.idType}: {profile.idNumber}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-300 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {profile.phoneNumber}
                        </span>
                      </div>

                      {/* Previous Visits & Vehicle */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {profile.totalVisits} previous visits
                        </span>
                        <span>
                          Last seen: {new Date(profile.lastVisitDate).toLocaleDateString()}
                        </span>
                        {profile.defaultVehiclePlate && (
                          <span className="flex items-center gap-1 text-slate-300 font-mono">
                            <Car className="w-3 h-3 text-slate-400" />
                            {profile.defaultVehiclePlate}
                          </span>
                        )}
                      </div>

                      {profile.isWatchlisted && (
                        <p className="text-xs text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-900/80 mt-2">
                          {profile.watchlistReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Action Button */}
                  <div className="sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        onSelectForCheckIn(profile);
                        onClose();
                      }}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all group"
                    >
                      <span>Expedited Check-In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Returning visitor profiles are permanently cached for rapid clearance.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
