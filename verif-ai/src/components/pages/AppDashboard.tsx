import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Database, ScanLine } from 'lucide-react';
import GenerateTab from './Tabs/GenerateTab';
import RegistryTab from './Tabs/RegistryTab';
import ScanTab from './Tabs/ScanTab';

const AppDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'generate';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'generate', label: 'Generate QR', icon: <QrCode size={18} /> },
    { id: 'registry', label: 'Product Registry', icon: <Database size={18} /> },
    { id: 'scan', label: 'Scan & Verify', icon: <ScanLine size={18} /> },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Tab Controller */}
      <div className="flex justify-center">
        <div className="glass flex gap-1 p-1.5 ring-1 ring-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 font-body text-sm font-bold tracking-wide transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-accent text-bg-void shadow-[0_0_20px_rgba(0,240,160,0.3)]'
                  : 'text-text-3 hover:bg-white/5 hover:text-text-1'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
          >
            {activeTab === 'generate' && <GenerateTab />}
            {activeTab === 'registry' && <RegistryTab />}
            {activeTab === 'scan' && <ScanTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppDashboard;
