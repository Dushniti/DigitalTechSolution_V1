import { useState } from 'react';
import { User, Building, FileText, Bell, File, Activity, Settings as SettingsIcon, Database, Check, AlertCircle } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import EmployeeProfileSettings from './EmployeeProfileSettings';
import CompanySettings from './CompanySettings';
import TemplateSettings from './TemplateSettings';
import NotificationSettings from './NotificationSettings';
import DocumentSettings from './DocumentSettings';
import AuditLogs from './AuditLogs';
import SystemSettings from './SystemSettings';

const getRoleFromToken = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;
  try {
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const payload = actualToken.split('.')[1];
    return JSON.parse(atob(payload)).role;
  } catch (e) {
    return null;
  }
};

const SettingsModule = () => {
  const role = getRoleFromToken();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User, roles: ['Admin', 'Company Admin', 'User', 'Employee', 'HR'] },
    { id: 'company', label: 'Company Profile', icon: Building, roles: ['Admin', 'Company Admin'] },
    { id: 'templates', label: 'Templates', icon: FileText, roles: ['Admin', 'Company Admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['Admin', 'Company Admin'] },
    { id: 'documents', label: 'Documents', icon: File, roles: ['Admin', 'Company Admin'] },
    { id: 'audit', label: 'Audit Logs', icon: Activity, roles: ['Admin', 'Company Admin'] },
    { id: 'system', label: 'System Settings', icon: SettingsIcon, roles: ['Admin'] },
    { id: 'backup', label: 'Backup Management', icon: Database, roles: ['Admin'] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(role));

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (role === 'Employee' || role === 'employee' || role === 'User' || role === 'user')
          ? <EmployeeProfileSettings />
          : <ProfileSettings />;
      case 'company': return <CompanySettings />;
      case 'templates': return <TemplateSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'documents': return <DocumentSettings />;
      case 'audit': return <AuditLogs />;
      case 'system': return <SystemSettings />;
      case 'backup': return <SystemSettings isBackup />;
      default:
        return (role === 'Employee' || role === 'employee' || role === 'User' || role === 'user')
          ? <EmployeeProfileSettings />
          : <ProfileSettings />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your preferences</p>
        </div>
        <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 md:p-3 gap-1 md:space-y-1">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 md:w-full ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-900">
        <div className="p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
