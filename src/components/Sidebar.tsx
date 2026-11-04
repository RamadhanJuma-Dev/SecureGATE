import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Truck, 
  ArrowLeftRight, 
  FileText, 
  Settings, 
  ShieldAlert,
  Flame,
  Search
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export type ActiveTab = 
  | 'dashboard'
  | 'visitors_checkin'
  | 'visitors_log'
  | 'fleet'
  | 'trips'
  | 'reports'
  | 'settings'
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenEvacuation: () => void;
  onOpenReturningLookup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenEvacuation,
  onOpenReturningLookup 
}) => {
  const { currentOfficer, visitorPasses, emergencyAlarmActive, trips } = useSecurity();

  // Active metrics for badges
  const overdueCount = visitorPasses.filter((p) => p.status === 'OVERDUE').length;
  const onSiteCount = visitorPasses.filter((p) => p.status === 'ON_SITE' || p.status === 'OVERDUE').length;
  const activeTripsCount = trips.filter((t) => t.status === 'ACTIVE').length;

  const isSupervisorOrAdmin = currentOfficer.role === 'SUPERVISOR' || currentOfficer.role === 'ADMIN';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Security Dashboard',
      icon: LayoutDashboard,
      badge: overdueCount > 0 ? `${overdueCount} Overdue` : undefined,
      badgeType: 'danger',
    },
    {
      id: 'visitors_checkin' as ActiveTab,
      label: 'Visitor Registration',
      icon: UserPlus,
    },
    {
      id: 'visitors_log' as ActiveTab,
      label: 'Visitor Movement Log',
      icon: Users,
      badge: onSiteCount > 0 ? `${onSiteCount} On-Site` : undefined,
      badgeType: 'info',
    },
    {
      id: 'fleet' as ActiveTab,
      label: 'Organizational Fleet',
      icon: Truck,
    },
    {
      id: 'trips' as ActiveTab,
      label: 'Vehicle Trips Dispatch',
      icon: ArrowLeftRight,
      badge: activeTripsCount > 0 ? `${activeTripsCount} Active` : undefined,
      badgeType: 'warning',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Movement Reports',
      icon: FileText,
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Security Audit Trail',
      icon: ShieldAlert,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Configuration',
      icon: Settings,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3">
        {/* Quick Returning Visitor Lookup Card Button */}
        <div className="mb-3">
          <button
            onClick={onOpenReturningLookup}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-300 text-xs font-medium transition-all group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Returning Visitor Search</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/60 text-emerald-200">
              ID / Plate
            </kbd>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      item.badgeType === 'danger'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : item.badgeType === 'warning'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Emergency Callout & Officer Shift Info */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenEvacuation}
          className={`w-full p-2.5 rounded-lg border text-left transition-all ${
            emergencyAlarmActive
              ? 'bg-rose-950/80 border-rose-600 text-white animate-pulse'
              : 'bg-slate-950/60 border-slate-800/80 hover:border-rose-900/50 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <Flame className="w-3.5 h-3.5" />
              Evacuation Muster
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/50 text-rose-200">
              Roll Call
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Headcount of all visitors and drivers on-site
          </p>
        </button>

        <div className="px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <p className="text-slate-300 font-medium">Logged in as:</p>
            <p className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
              {currentOfficer.role}
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Security session active"></span>
        </div>
      </div>
    </aside>
  );
};
