import React, { useState } from 'react';
import DashboardNav from '../components/dashboard/DashboardNav.jsx';
import TabBar from '../components/dashboard/TabBar.jsx';
import GenerateTab from '../components/dashboard/GenerateTab.jsx';
import VerifyTab from '../components/dashboard/VerifyTab.jsx';
import DatabaseTab from '../components/dashboard/DatabaseTab.jsx';
import { ToastProvider } from '../components/dashboard/Toast.jsx';
import '../styles/dashboard.css';

function TabContent({ activeTab }) {
  switch (activeTab) {
    case 'generate': return <GenerateTab />;
    case 'verify':   return <VerifyTab />;
    case 'database': return <DatabaseTab />;
    default:         return <GenerateTab />;
  }
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <ToastProvider>
      <div className="dashboard-page">
        <DashboardNav />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="dashboard-content">
          <TabContent activeTab={activeTab} />
        </main>
      </div>
    </ToastProvider>
  );
}
