import React, { useState } from 'react';
import { Users, Building, Briefcase } from 'lucide-react';
import DepartmentsTab from './organization/DepartmentsTab';
import DesignationsTab from './organization/DesignationsTab';
import EmployeesTab from './organization/EmployeesTab';

const OrganizationModule = () => {
  const [activeTab, setActiveTab] = useState('employees');

  const tabs = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'designations', label: 'Designations', icon: Briefcase },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Master</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage employees, departments, and designations</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-slate-800">
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
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
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'designations' && <DesignationsTab />}
        {activeTab === 'employees' && <EmployeesTab />}
      </div>
    </div>
  );
};

export default OrganizationModule;
