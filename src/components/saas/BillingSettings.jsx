import React, { useState, useEffect } from 'react';
import {
  CreditCard, History, RefreshCw, CheckCircle2, AlertCircle, Crown,
  ShieldCheck, Zap, Receipt, TrendingUp, Calendar, IndianRupee,
  BadgeCheck, XCircle, Clock, ArrowUpRight, Sparkles, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const STATUS_CONFIG = {
  Success:             { icon: BadgeCheck, textColor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Success' },
  Pending:             { icon: Clock,      textColor: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400',   label: 'Pending' },
  Failed:              { icon: XCircle,    textColor: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'Failed' },
  'Failed Verification': { icon: XCircle, textColor: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500',     label: 'Failed' },
};

const PLAN_ICONS = [Star, Crown, Sparkles];

const BillingSettings = () => {
  const [activeSection, setActiveSection] = useState('subscription');
  const [subscription, setSubscription]   = useState(null);
  const [plans, setPlans]                 = useState([]);
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [txLoading, setTxLoading]         = useState(false);
  const [error, setError]                 = useState('');
  const [payingPlanId, setPayingPlanId]   = useState(null);
  const [txPage, setTxPage]               = useState(1);
  const [txFilter, setTxFilter]           = useState('All');
  const TX_PER_PAGE = 5;

  const loadScript = (src) => new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (activeSection === 'transactions' && transactions.length === 0) fetchTransactions();
    setTxPage(1); // reset page on tab switch
  }, [activeSection]);

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch(`${config.apiUrl}/saas/subscriptions/my-subscription`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/saas/plans`,                          { headers: authHeaders() }),
      ]);
      const subData   = await subRes.json();
      const plansData = await plansRes.json();
      if (subData.success)   setSubscription(subData.data);
      if (plansData.success) setPlans(plansData.data.filter(p => p.status === 'Active'));
    } catch { setError('Failed to load billing data'); }
    finally  { setLoading(false); }
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res  = await fetch(`${config.apiUrl}/saas/payments/my-transactions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setTransactions(data.data);
      else setError(data.message || 'Failed to load transactions');
    } catch { setError('Failed to load transactions'); }
    finally  { setTxLoading(false); }
  };

  const handleUpgrade = async (plan) => {
    setPayingPlanId(plan._id);
    try {
      if (!await loadScript('https://checkout.razorpay.com/v1/checkout.js')) {
        alert('Razorpay SDK failed to load.'); setPayingPlanId(null); return;
      }
      const payRes  = await fetch(`${config.apiUrl}/saas/payments/pay`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ planId: plan._id, billingCycle: plan.billing_cycle, amount: plan.price }),
      });
      const payData = await payRes.json();
      if (!payData.success) { alert('Could not initiate payment'); setPayingPlanId(null); return; }

      let userName = 'Company Admin', userEmail = 'admin@company.com';
      try {
        const tok = localStorage.getItem('adminToken');
        if (tok) {
          const actual  = tok.startsWith('Bearer ') ? tok.split(' ')[1] : tok;
          const decoded = JSON.parse(atob(actual.split('.')[1]));
          if (decoded.name)  userName  = decoded.name;
          if (decoded.email) userEmail = decoded.email;
        }
      } catch { /* silent */ }

      new window.Razorpay({
        key: payData.data.key_id, amount: payData.data.amount,
        currency: payData.data.currency, name: 'Digital Tech Solution',
        description: `Upgrade to ${plan.name} (${plan.billing_cycle})`,
        order_id: payData.data.orderId,
        handler: async (response) => {
          try {
            const vRes  = await fetch(`${config.apiUrl}/saas/payments/verify`, {
              method: 'POST', headers: authHeaders(),
              body: JSON.stringify({ ...response, status: 'Success' }),
            });
            const vData = await vRes.json();
            if (vData.success) { alert('Subscription upgraded!'); fetchData(); setTransactions([]); }
            else alert('Payment verification failed.');
          } catch { alert('Error during verification'); }
          finally { setPayingPlanId(null); }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: () => setPayingPlanId(null) },
      }).open();
    } catch { alert('Error processing payment'); setPayingPlanId(null); }
  };

  const txStats = {
    total:       transactions.length,
    success:     transactions.filter(t => t.status === 'Success').length,
    totalAmount: transactions.filter(t => t.status === 'Success').reduce((s, t) => s + (t.amount || 0), 0),
    pending:     transactions.filter(t => t.status === 'Pending').length,
  };

  if (loading) return (
    <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading billing data...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Page Header ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <CreditCard size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Billing &amp; Subscription</h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">Manage your plan, track payments and upgrade anytime.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Tab Navigation ── */}
      <div className="flex mb-8 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {[
          { id: 'subscription', icon: CreditCard, label: 'Subscription & Plans' },
          { id: 'transactions', icon: History,    label: 'Transaction History'  },
        ].map(tab => {
          const TabIcon = tab.icon;
          const active  = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
                active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════════
            TAB 1 — Subscription & Plans
        ════════════════════════════════════════ */}
        {activeSection === 'subscription' && (
          <motion.div key="sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* Current Subscription Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 p-7 mb-10 shadow-xl">
              {/* decorative blobs */}
              <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-inner">
                    <Crown size={26} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Active Plan</p>
                    <h2 className="text-2xl font-bold text-white leading-tight">
                      {subscription?.plan_name || 'No Plan'}&nbsp;
                      <span className="text-blue-300 font-semibold text-lg">Plan</span>
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {[
                    { label: 'Status',   value: subscription?.status         || '—' },
                    { label: 'Billing',  value: subscription?.billing_cycle  || '—' },
                    { label: 'Expires',  value: subscription?.expiry_date
                        ? new Date(subscription.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—' },
                  ].map(item => (
                    <div key={item.label} className="bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                      <p className="text-blue-300 text-[10px] uppercase font-bold tracking-widest mb-0.5">{item.label}</p>
                      <p className={`font-bold text-sm ${item.label === 'Status' && subscription?.status === 'Expired' ? 'text-red-400' : 'text-white'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {subscription?.status === 'Expired' && (
                <div className="relative z-10 mt-5 flex items-center gap-2.5 px-4 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm font-semibold">
                  <AlertCircle size={16} /> Your subscription has expired. Please renew below.
                </div>
              )}
            </div>

            {/* Plans Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Available Plans</h3>
                <p className="text-gray-500 text-sm mt-0.5">Choose the plan that fits your business needs.</p>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const isCurrent = subscription?.plan_id === plan._id;
                const PlanIcon  = PLAN_ICONS[index % PLAN_ICONS.length];
                let canRenew = true, daysLeft = 0;
                if (isCurrent && subscription?.expiry_date) {
                  const diffDays = Math.ceil((new Date(subscription.expiry_date) - new Date()) / 86400000);
                  canRenew = diffDays <= 1;
                  daysLeft = diffDays > 1 ? diffDays - 1 : 0;
                }

                return (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      isCurrent
                        ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20 bg-white dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300'
                    }`}
                  >
                    {isCurrent && (
                      <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5 px-3">
                        ✦ Current Plan ✦
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      {/* Icon + Name */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-gray-100 dark:bg-slate-800'}`}>
                          <PlanIcon size={18} className={isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">{plan.name}</h4>
                          <p className="text-gray-400 text-xs">{plan.billing_cycle}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{plan.price?.toLocaleString('en-IN')}</span>
                          <span className="text-gray-400 text-sm mb-1 font-medium">/{plan.billing_cycle === 'Yearly' ? 'yr' : 'mo'}</span>
                        </div>
                        {plan.description && <p className="text-gray-400 text-xs mt-1.5">{plan.description}</p>}
                      </div>

                      {/* Features */}
                      <div className="space-y-2.5 mb-6 flex-1">
                        <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                          <span>Up to <strong>{plan.max_users}</strong> Users</span>
                        </div>
                        {plan.features?.map((f, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={payingPlanId !== null || (isCurrent && !canRenew)}
                        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                          isCurrent
                            ? canRenew
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-600'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/30'
                        }`}
                      >
                        {payingPlanId === plan._id
                          ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Processing...</>
                          : isCurrent
                            ? canRenew
                              ? <><RefreshCw size={15} /> Renew Plan</>
                              : <><Clock size={15} /> Renew in {daysLeft} days</>
                            : <><ArrowUpRight size={15} /> Upgrade Now</>
                        }
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            TAB 2 — Transaction History
        ════════════════════════════════════════ */}
        {activeSection === 'transactions' && (
          <motion.div key="tx" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Transactions', value: txStats.total,                                      icon: Receipt,     border: 'border-blue-100 dark:border-blue-900/40',       iconBg: 'bg-blue-50 dark:bg-blue-900/30',       iconColor: 'text-blue-600 dark:text-blue-400' },
                { label: 'Successful',         value: txStats.success,                                    icon: BadgeCheck,  border: 'border-emerald-100 dark:border-emerald-900/40', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Amount Paid',        value: `₹${txStats.totalAmount.toLocaleString('en-IN')}`, icon: IndianRupee, border: 'border-violet-100 dark:border-violet-900/40',  iconBg: 'bg-violet-50 dark:bg-violet-900/30',   iconColor: 'text-violet-600 dark:text-violet-400' },
                { label: 'Pending',            value: txStats.pending,                                    icon: Clock,       border: 'border-amber-100 dark:border-amber-900/40',    iconBg: 'bg-amber-50 dark:bg-amber-900/30',     iconColor: 'text-amber-600 dark:text-amber-400' },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`bg-white dark:bg-slate-900 rounded-xl border ${stat.border} px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}>
                      <StatIcon size={15} className={stat.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>


            {/* Transaction Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">

              {/* Table Header + Filter */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                {/* Title row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <History size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Payment History</h3>
                      <p className="text-xs text-gray-400 hidden sm:block">All subscription payments for your company</p>
                    </div>
                  </div>
                  {/* Refresh — icon only on mobile */}
                  <button
                    onClick={fetchTransactions}
                    disabled={txLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={txLoading ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {/* Filter Pills — horizontally scrollable on mobile */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {['All', 'Success', 'Pending', 'Failed'].map(f => {
                    const PILL_STYLES = {
                      All:     { active: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900', dot: '' },
                      Success: { active: 'bg-emerald-500 text-white', dot: 'bg-emerald-500' },
                      Pending: { active: 'bg-amber-400 text-white',   dot: 'bg-amber-400'   },
                      Failed:  { active: 'bg-red-500 text-white',     dot: 'bg-red-500'     },
                    };
                    const isActive = txFilter === f;
                    const count = f === 'All'
                      ? transactions.length
                      : transactions.filter(t => t.status === f || (f === 'Failed' && (t.status === 'Failed' || t.status === 'Failed Verification'))).length;
                    return (
                      <button
                        key={f}
                        onClick={() => { setTxFilter(f); setTxPage(1); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 shrink-0 ${
                          isActive
                            ? `${PILL_STYLES[f].active} border-transparent shadow-sm`
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {f !== 'All' && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white/80' : PILL_STYLES[f].dot}`} />}
                        {f}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                        }`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Loading */}
              {txLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading transactions...</p>
                </div>
              )}

              {/* Empty State */}
              {!txLoading && transactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Receipt size={28} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
                    Your payment history will appear here once you make your first subscription payment.
                  </p>
                </div>
              )}

              {/* Table */}
              {!txLoading && transactions.length > 0 && (() => {
                // Apply status filter
                const filtered = txFilter === 'All'
                  ? transactions
                  : transactions.filter(t =>
                      txFilter === 'Failed'
                        ? t.status === 'Failed' || t.status === 'Failed Verification'
                        : t.status === txFilter
                    );

                const totalPages = Math.ceil((filtered.length || 1) / TX_PER_PAGE);
                const startIdx   = (txPage - 1) * TX_PER_PAGE;
                const paginated  = filtered.slice(startIdx, startIdx + TX_PER_PAGE);

                // build visible page numbers (max 5 pills)
                const getPageNums = () => {
                  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
                  if (txPage <= 3) return [1, 2, 3, 4, '…', totalPages];
                  if (txPage >= totalPages - 2) return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  return [1, '…', txPage - 1, txPage, txPage + 1, '…', totalPages];
                };

                return (
                  <>
                    {/* ── MOBILE: Card List (hidden on md+) ── */}
                    <div className="md:hidden flex flex-col gap-3 p-3">
                      {paginated.length === 0 ? null : paginated.map((tx, idx) => {
                        const cfg       = STATUS_CONFIG[tx.status] || STATUS_CONFIG['Pending'];
                        const globalIdx = startIdx + idx;
                        return (
                          <motion.div
                            key={tx._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4"
                          >
                            {/* Top row: plan icon + name + status badge */}
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                                  <CreditCard size={14} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{tx.plan?.name || 'Unknown Plan'}</p>
                                  <p className="text-[11px] text-gray-400 font-mono"># {String(globalIdx + 1).padStart(2, '0')}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shrink-0 ${cfg.bg} ${cfg.textColor} ${cfg.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </div>

                            {/* Info grid: amount, cycle, date */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-center">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Amount</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">₹{(tx.amount || 0).toLocaleString('en-IN')}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-center">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Cycle</p>
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tx.billing_cycle || '—'}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-center">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Date</p>
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {tx.payment_date ? new Date(tx.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                                </p>
                              </div>
                            </div>

                            {/* Transaction ID */}
                            {tx.transaction_id && (
                              <div className="flex items-center gap-2 pt-2.5 mt-1 border-t border-gray-100 dark:border-slate-700">
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider shrink-0">Txn ID:</p>
                                <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded truncate">
                                  {tx.transaction_id.substring(0, 28)}…
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* ── DESKTOP: Table (hidden on mobile) ── */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-3.5 text-left">#</th>
                            <th className="px-6 py-3.5 text-left">Plan</th>
                            <th className="px-6 py-3.5 text-left">Cycle</th>
                            <th className="px-6 py-3.5 text-right">Amount</th>
                            <th className="px-6 py-3.5 text-left">Status</th>
                            <th className="px-6 py-3.5 text-left">Transaction ID</th>
                            <th className="px-6 py-3.5 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {paginated.map((tx, idx) => {
                            const cfg       = STATUS_CONFIG[tx.status] || STATUS_CONFIG['Pending'];
                            const globalIdx = startIdx + idx;
                            return (
                              <motion.tr
                                key={tx._id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors"
                              >
                                <td className="px-6 py-4 text-gray-300 dark:text-gray-600 text-xs font-mono">{String(globalIdx + 1).padStart(2, '0')}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                      <CreditCard size={13} className="text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.plan?.name || 'Unknown Plan'}</p>
                                      {tx.plan?.description && <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{tx.plan.description}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                    <Calendar size={10} />
                                    {tx.billing_cycle || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="font-bold text-gray-900 dark:text-white">₹{(tx.amount || 0).toLocaleString('en-IN')}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.textColor} ${cfg.border}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-2 py-1 rounded-md">
                                    {tx.transaction_id ? `${tx.transaction_id.substring(0, 20)}…` : '—'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {tx.payment_date ? new Date(tx.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    {tx.payment_date ? new Date(tx.payment_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </p>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>


                    {/* ── Pagination Controls ── */}
                    {filtered.length > TX_PER_PAGE && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      {/* Info text */}
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{startIdx + 1}</span>–<span className="font-semibold text-gray-600 dark:text-gray-300">{Math.min(startIdx + TX_PER_PAGE, transactions.length)}</span> of <span className="font-semibold text-gray-600 dark:text-gray-300">{transactions.length}</span> transactions
                      </p>

                      {/* Page controls */}
                      <div className="flex items-center gap-1">
                        {/* Prev */}
                        <button
                          onClick={() => setTxPage(p => Math.max(1, p - 1))}
                          disabled={txPage === 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                          Prev
                        </button>

                        {/* Page numbers */}
                        {getPageNums().map((p, i) =>
                          p === '…'
                            ? <span key={`ellipsis-${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                            : <button
                                key={p}
                                onClick={() => setTxPage(p)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                  txPage === p
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {p}
                              </button>
                        )}

                        {/* Next */}
                        <button
                          onClick={() => setTxPage(p => Math.min(totalPages, p + 1))}
                          disabled={txPage === totalPages}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>
                    </div>
                    )}
                    {filtered.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-14">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Receipt size={22} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No {txFilter} transactions found</p>
                        <button onClick={() => setTxFilter('All')} className="mt-2 text-xs text-blue-500 hover:underline font-medium">Clear filter</button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BillingSettings;
