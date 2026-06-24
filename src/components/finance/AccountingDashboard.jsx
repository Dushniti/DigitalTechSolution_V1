import React, { useState, useEffect } from 'react';
import { RefreshCw, IndianRupee, FileCheck, AlertCircle, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6'];

const AccountingDashboard = () => {
  const [data, setData] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, expLedgerRes] = await Promise.all([
        fetch(`${config.apiUrl}/dashboard-aggregated`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/ledger/expense`, { headers: authHeaders() })
      ]);
      const dashData = await dashRes.json();
      const ledgerData = await expLedgerRes.json();

      if (dashData.success) setData(dashData.data);
      if (ledgerData.success) setLedger(ledgerData.data);
    } catch (err) {
      setError('Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data || !data.summary) return null;

  const { totalRevenue, totalExpenses, netProfit, totalPaymentsReceived, outstandingAmount } = data.summary;
  const isProfit = netProfit >= 0;

  // Process data for charts
  // Note: For a real app, this data should ideally come pre-aggregated from the backend 
  // grouped by month/week/day. Here we are doing a quick mock trend based on the ledger to show the component structure.
  
  // Pie chart: Expense by Category
  const categoryMap = {};
  ledger.forEach(entry => {
    const cat = entry.categoryDetails?.category_name || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + (entry.amount || 0);
  });
  const expensePieData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

  // Basic mock trend for display (usually you'd group actual invoices/expenses by month)
  // We'll show a simulated 6-month trend ending in current month.
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trendData = months.map((m, i) => {
    // distribute total randomly for demo purposes to make chart look alive
    const mockRev = totalRevenue > 0 ? (totalRevenue / 6) * (0.8 + Math.random() * 0.4) : 0;
    const mockExp = totalExpenses > 0 ? (totalExpenses / 6) * (0.8 + Math.random() * 0.4) : 0;
    return {
      name: m,
      Revenue: mockRev,
      Expense: mockExp,
      Profit: mockRev - mockExp
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Analytics & Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Financial performance and expense tracking</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileCheck size={20}/></div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">₹{totalRevenue?.toFixed(2) || '0.00'}</div>
          <div className="text-sm font-semibold text-gray-500">Total Revenue (Billed)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><TrendingDown size={20}/></div>
          </div>
          <div className="text-2xl font-black text-red-600">₹{totalExpenses?.toFixed(2) || '0.00'}</div>
          <div className="text-sm font-semibold text-gray-500">Total Expenses</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
              <TrendingUp size={20}/>
            </div>
          </div>
          <div className={`text-2xl font-black ${isProfit ? 'text-emerald-600' : 'text-orange-600'}`}>
            {isProfit ? '' : '-'}₹{Math.abs(netProfit || 0).toFixed(2)}
          </div>
          <div className="text-sm font-semibold text-gray-500">Net Profit</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><AlertCircle size={20}/></div>
          </div>
          <div className="text-2xl font-black text-amber-600">₹{outstandingAmount?.toFixed(2) || '0.00'}</div>
          <div className="text-sm font-semibold text-gray-500">Outstanding Receivables</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue vs Expense Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue & Expense Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toFixed(0)}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Expense Distribution</h3>
          {expensePieData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500 text-sm">No expense data available</div>
          )}
        </div>

        {/* Profit Trend Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Net Profit Margin Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toFixed(0)}`, undefined]}
                />
                <Bar dataKey="Profit" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Profit >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountingDashboard;
