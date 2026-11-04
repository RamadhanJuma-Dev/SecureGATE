/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';

// Unified Login Page
import { GatekeeperLoginPage } from './components/Auth/GatekeeperLoginPage';
import { LockScreenModal } from './components/Auth/LockScreenModal';

// 1. Gate Operations Dashboard (Security Officer)
import { GatekeeperPortalView } from './components/Dashboard/GatekeeperPortalView';

// 2. System Administration Dashboard (System Administrator)
import { SystemAdminDashboardView } from './components/Admin/SystemAdminDashboardView';

// 3. Security Operations Dashboard (Security Supervisor)
import { SecuritySupervisorDashboardView } from './components/Supervisor/SecuritySupervisorDashboardView';

// 4. Management Overview Dashboard (Management)
import { ManagementOverviewDashboardView } from './components/Management/ManagementOverviewDashboardView';

// Operational Modals for Gate Operations
import { RegistrationsActionModal } from './components/Visitors/RegistrationsActionModal';
import { CheckOutsActionModal } from './components/Visitors/CheckOutsActionModal';
import { VehicleCheckInsActionModal } from './components/Vehicles/VehicleCheckInsActionModal';
import { VisitorPassModal } from './components/Visitors/VisitorPassModal';
import { VisitorCheckOutModal } from './components/Visitors/VisitorCheckOutModal';
import { VehicleReturnModal } from './components/Vehicles/VehicleReturnModal';
import { VehicleDispatchModal } from './components/Vehicles/VehicleDispatchModal';

// Types
import { VisitorPass } from './types/visitor';
import { VehicleTrip } from './types/vehicle';

function SecuritySystemApp() {
  const { currentOfficer } = useSecurity();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modals for Gate Operations
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [checkOutsOpen, setCheckOutsOpen] = useState(false);
  const [vehicleCheckInsOpen, setVehicleCheckInsOpen] = useState(false);

  const [activeBadgePass, setActiveBadgePass] = useState<VisitorPass | null>(null);
  const [checkOutPass, setCheckOutPass] = useState<VisitorPass | null>(null);
  const [returnTripModal, setReturnTripModal] = useState<VehicleTrip | null>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // 1. ONE Login Page for all users
  if (!isLoggedIn) {
    return <GatekeeperLoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <LockScreenModal />
      {/* 2. Role-Based Routing: System Administrator -> System Administration Dashboard */}
      {currentOfficer.role === 'ADMIN' && (
        <SystemAdminDashboardView onLogout={() => setIsLoggedIn(false)} />
      )}

      {/* 3. Role-Based Routing: Security Supervisor -> Security Operations Dashboard */}
      {currentOfficer.role === 'SUPERVISOR' && (
        <>
          <SecuritySupervisorDashboardView
            onLogout={() => setIsLoggedIn(false)}
            onSelectPassForDetails={(pass) => setActiveBadgePass(pass)}
            onSelectTripForDetails={(trip) => setReturnTripModal(trip)}
          />

          <VisitorPassModal
            pass={activeBadgePass}
            isOpen={!!activeBadgePass}
            onClose={() => setActiveBadgePass(null)}
            onCheckOut={(pass) => setCheckOutPass(pass)}
          />

          <VehicleReturnModal
            trip={returnTripModal}
            isOpen={!!returnTripModal}
            onClose={() => setReturnTripModal(null)}
          />
        </>
      )}

      {/* 4. Role-Based Routing: Management -> Management Overview Dashboard (Read-Only) */}
      {currentOfficer.role === 'MANAGEMENT' && (
        <ManagementOverviewDashboardView onLogout={() => setIsLoggedIn(false)} />
      )}

      {/* 5. Role-Based Routing: Security Officer (OFFICER) -> Gate Operations Dashboard */}
      {currentOfficer.role === 'OFFICER' && (
        <div className="min-h-screen bg-gradient-to-b from-[#e3f2fd] via-[#edf6fd] to-[#e0f0fe]">
          <GatekeeperPortalView
            onLogout={() => setIsLoggedIn(false)}
            onOpenRegistrations={() => setRegistrationsOpen(true)}
            onOpenCheckOuts={() => setCheckOutsOpen(true)}
            onOpenVehicleCheckIns={() => setVehicleCheckInsOpen(true)}
            onSelectPassForBadge={(pass) => setActiveBadgePass(pass)}
            onSelectPassForCheckOut={(pass) => setCheckOutPass(pass)}
            onSelectTripForReturn={(trip) => setReturnTripModal(trip)}
          />

          {/* Gate Operations Action Modals */}
          <RegistrationsActionModal
            isOpen={registrationsOpen}
            onClose={() => setRegistrationsOpen(false)}
            onSuccess={(pass) => setActiveBadgePass(pass)}
          />

          <CheckOutsActionModal
            isOpen={checkOutsOpen}
            onClose={() => setCheckOutsOpen(false)}
            onSelectPassForCheckOut={(pass) => setCheckOutPass(pass)}
          />

          <VehicleCheckInsActionModal
            isOpen={vehicleCheckInsOpen}
            onClose={() => setVehicleCheckInsOpen(false)}
            onSelectTripForReturn={(trip) => setReturnTripModal(trip)}
          />

          <VehicleDispatchModal
            vehicle={null}
            isOpen={dispatchModalOpen}
            onClose={() => setDispatchModalOpen(false)}
            onSuccess={() => {}}
          />

          <VisitorPassModal
            pass={activeBadgePass}
            isOpen={!!activeBadgePass}
            onClose={() => setActiveBadgePass(null)}
            onCheckOut={(pass) => setCheckOutPass(pass)}
          />

          <VisitorCheckOutModal
            pass={checkOutPass}
            isOpen={!!checkOutPass}
            onClose={() => setCheckOutPass(null)}
          />

          <VehicleReturnModal
            trip={returnTripModal}
            isOpen={!!returnTripModal}
            onClose={() => setReturnTripModal(null)}
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <SecuritySystemApp />
    </SecurityProvider>
  );
}
