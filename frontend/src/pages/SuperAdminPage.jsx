import React from 'react';
import SuperAdminDashboard from '../components/superAdmin/SuperAdminDashboard';


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