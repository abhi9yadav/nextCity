import React from 'react';
import SuperAdminDashboard from '../components/superAdmin/SuperAdminDashboard';
import SuperAdminNavbar from '../components/superAdmin/SuperAdminNavbar';
import SuperAdminFooter from '../components/superAdmin/superAdminFooter';


function SuperAdminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow">
        <SuperAdminDashboard />
      </main>
    </div>
  );
}

export default SuperAdminPage;