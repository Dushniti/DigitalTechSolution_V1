import React, { useState, useEffect } from 'react';
import { CreditCard, History, RefreshCw, CheckCircle2, AlertCircle, Crown, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import config from '../../config';

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const BillingSettings = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingPlanId, setPayingPlanId] = useState(null);

  // Helper to load Razorpay script dynamically
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch(`${config.apiUrl}/saas/subscriptions/my-subscription`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/saas/plans`, { headers: authHeaders() })
      ]);

      const subData = await subRes.json();
      const plansData = await plansRes.json();

      if (subData.success) {
        setSubscription(subData.data);
      }

      if (plansData.success) {
        setPlans(plansData.data.filter(p => p.status === 'Active'));
      }
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setPayingPlanId(plan._id);
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setPayingPlanId(null);
        return;
      }

      const payRes = await fetch(`${config.apiUrl}/saas/payments/pay`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          planId: plan._id,
          billingCycle: plan.billing_cycle,
          amount: plan.price
        })
      });
      const payData = await payRes.json();

      if (!payData.success) {
        alert('Could not initiate payment');
        setPayingPlanId(null);
        return;
      }

      let userName = 'Company Admin';
      let userEmail = 'admin@company.com';
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
          const decoded = JSON.parse(atob(actualToken.split('.')[1]));
          if (decoded.name) userName = decoded.name;
          if (decoded.email) userEmail = decoded.email;
        }
      } catch (e) {
        console.warn('Could not parse user token for prefill');
      }

      const options = {
        key: payData.data.key_id,
        amount: payData.data.amount,
        currency: payData.data.currency,
        name: 'Digital Tech Solution',
        description: `Upgrade to ${plan.name} (${plan.billing_cycle})`,
        order_id: payData.data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${config.apiUrl}/saas/payments/verify`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                status: 'Success'
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert('Subscription upgraded successfully!');
              fetchData();
            } else {
              alert('Payment verification failed.');
            }
          } catch (err) {
            alert('Error during verification');
          } finally {
            setPayingPlanId(null);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: function () {
            setPayingPlanId(null);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      alert('Error processing payment');
      setPayingPlanId(null);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <RefreshCw className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="mb-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          Billing & Subscription
        </motion.h2>
        <p className="text-gray-500 text-base mt-2 max-w-2xl mx-auto">Manage your active plans, payment history, and team capabilities.</p>
      </div>

      {error && (
        <div className="mb-6 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800 flex items-center gap-3 font-medium">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Current Subscription Premium Card (Blue Theme) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-600/20 p-8 mb-16 group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <Crown size={160} className="text-white" />
        </div>
        <div className="absolute -inset-1 bg-white/5 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/20 text-white backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <ShieldCheck size={16} /> Active Subscription
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{subscription?.plan_name || plans.find(p => p._id === subscription?.plan_id)?.name || 'N/A'} Plan</h3>
            <div className="flex items-center gap-4 text-blue-100 text-sm font-medium">
              <p>Status: <span className="text-white bg-white/20 px-2 py-0.5 rounded">{subscription?.status}</span></p>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
              <p>Expires: <span className="text-white">{subscription?.expiry_date ? new Date(subscription.expiry_date).toLocaleDateString() : 'N/A'}</span></p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {subscription?.status === 'Expired' && (
              <div className="flex items-center gap-3 p-4 bg-red-500 text-white rounded-2xl text-sm font-semibold shadow-lg">
                <AlertCircle size={20} />
                Subscription expired. Please renew.
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Available Plans */}
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Choose the Right Plan</h3>
        <p className="text-gray-500 text-base mt-2">Upgrade your capabilities as your business grows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isCurrent = subscription?.plan_id === plan._id;

          // Logic for renewal restriction
          let canRenew = true;
          let daysUntilRenewable = 0;
          if (isCurrent && subscription?.expiry_date) {
            const expiry = new Date(subscription.expiry_date);
            const now = new Date();
            const diffTime = expiry.getTime() - now.getTime();
            const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            canRenew = daysUntilExpiry <= 1;
            daysUntilRenewable = daysUntilExpiry > 1 ? daysUntilExpiry - 1 : 0;
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={plan._id}
              className={`relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700'}`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-wide uppercase shadow-md">
                  Current Plan
                </div>
              )}

              <div className="mb-6 text-center mt-2">
                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                <p className="text-gray-500 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 text-center">
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">₹{plan.price}</span>
                  <span className="text-gray-500 text-lg mb-1 font-medium">/{plan.billing_cycle === 'Yearly' ? 'yr' : 'mo'}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1 bg-blue-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-blue-50 dark:border-slate-700/50">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Up to {plan.max_users} Users</span>
                </div>
                {plan.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={payingPlanId !== null || (isCurrent && !canRenew)}
                className={`w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ${
                  isCurrent
                    ? (canRenew 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-gray-500')
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/30'
                }`}
              >
                {payingPlanId === plan._id ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Zap size={20} className={isCurrent ? 'opacity-50' : ''} />
                )}
                {payingPlanId === plan._id
                  ? 'Processing...'
                  : (isCurrent
                    ? (canRenew ? 'Renew Plan' : `Renew in ${daysUntilRenewable} Days`)
                    : 'Upgrade Now')}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BillingSettings;
