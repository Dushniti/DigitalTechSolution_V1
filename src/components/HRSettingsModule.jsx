import React, { useState } from 'react';
import { CalendarDays, Clock, Settings, FileText } from 'lucide-react';
import LeaveTypesTab from './hr-settings/LeaveTypesTab';
import ShiftsTab from './hr-settings/ShiftsTab';
import HolidaysTab from './hr-settings/HolidaysTab';

import RosterTab from './hr-settings/RosterTab';

const HRSettingsModule = () => {
  const [activeTab, setActiveTab] = useState('leave-types');

  const tabs = [
    { id: 'leave-types', label: 'Leave Types', icon: FileText },
    { id: 'shifts', label: 'Shifts', icon: Clock },
    { id: 'holidays', label: 'Holidays', icon: CalendarDays },
    { id: 'roster', label: 'Roster', icon: CalendarDays },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">HR Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure company-wide policies, shifts, and leaves</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-slate-800">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 min-h-[500px]">
        {activeTab === 'leave-types' && <LeaveTypesTab />}
        {activeTab === 'shifts' && <ShiftsTab />}
        {activeTab === 'holidays' && <HolidaysTab />}
        {activeTab === 'roster' && <RosterTab />}
      </div>
    </div>
  );
};

export default HRSettingsModule;
