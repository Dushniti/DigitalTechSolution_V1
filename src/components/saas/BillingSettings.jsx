import React, { useState, useEffect } from 'react';
import { CreditCard, History, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Need to fetch company's active subscription and available plans
      const [subRes, plansRes] = await Promise.all([
        fetch(`${config.apiUrl}/saas/subscriptions`, { headers: authHeaders() }),
        fetch(`${config.apiUrl}/saas/plans`, { headers: authHeaders() })
      ]);
      
      const subData = await subRes.json();
      const plansData = await plansRes.json();

      if (subData.success) {
        // Find the first subscription since we are Company Admin viewing our own
        setSubscription(subData.data[0]); 
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
    setPaying(true);
    try {
      // Call mock payment gateway
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
      
      if (payData.success) {
        // Verify payment
        const verifyRes = await fetch(`${config.apiUrl}/saas/payments/verify`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            transactionId: payData.data.transactionId,
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
      } else {
        alert('Payment failed');
      }
    } catch (err) {
      alert('Error processing payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="p-6">Loading billing info...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your plan and billing history.</p>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Current Subscription */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Current Plan: {subscription?.planDetails?.name || 'N/A'}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Status: <span className="font-semibold text-blue-600">{subscription?.status}</span></p>
          <p className="text-sm text-gray-500">Expires on: {subscription?.expiry_date ? new Date(subscription.expiry_date).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="flex gap-4">
           {subscription?.status === 'Expired' && (
             <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-semibold">
               <AlertCircle size={18} />
               Your subscription has expired. Please renew to continue using the platform.
             </div>
           )}
        </div>
      </div>

      {/* Available Plans */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upgrade Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-md transition-shadow">
             <div className="mb-4">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                <p className="text-gray-500 text-sm">{plan.description}</p>
             </div>
             
             <div className="mb-6">
               <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹{plan.price}</span>
               <span className="text-gray-500 text-sm">/{plan.billing_cycle === 'Yearly' ? 'yr' : 'mo'}</span>
             </div>

             <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Up to {plan.max_users} Users</span>
                </div>
                {plan.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>{f}</span>
                  </div>
                ))}
             </div>

             <button
               onClick={() => handleUpgrade(plan)}
               disabled={paying}
               className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
             >
               <CreditCard size={18} />
               {paying ? 'Processing...' : (subscription?.plan_id === plan._id ? 'Renew Plan' : 'Upgrade')}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingSettings;
