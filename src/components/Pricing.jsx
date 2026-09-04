import React, { useState, useEffect } from 'react'
import { Globe, Server, Smartphone, Cloud, CheckCircle2, Crown, Sparkles, Star, RefreshCw, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import config from '../config'

// WhatsApp contact used by ServiceModal — keep consistent
const WHATSAPP_COUNTRY = '91'
const WHATSAPP_PHONE = '7983614392'

// Build and open a WhatsApp message (URL-encoded)
function openWhatsApp(message) {
  try {
    const encoded = encodeURIComponent(message)
    const url = `https://wa.me/${WHATSAPP_COUNTRY}${WHATSAPP_PHONE}?text=${encoded}`
    window.open(url, '_blank')
  } catch (err) {
    console.error('WhatsApp open error', err)
  }
}

const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getToken() || '',
});

const PLAN_ICONS = [Star, Crown, Sparkles];

// Fallback hardcoded packages (used when API plans unavailable)
const fallbackPackages = [
  {
    title: 'Starter',
    price: '₹14,999',
    features: [
      'Custom 3–5 page website',
      'Basic SEO setup',
      'Responsive design',
      '1 month support',
    ],
    highlighted: false,
  },
  {
    title: 'Business',
    price: '₹29,999',
    features: [
      'Up to 10 pages & CMS',
      'Advanced SEO & analytics',
      'Performance optimization',
      '3 months priority support',
    ],
    highlighted: true,
  },
  {
    title: 'Premium',
    price: '₹49,999+',
    features: [
      'E-commerce / Web app',
      'Mobile-friendly & PWA',
      'Ongoing growth & marketing',
      'Dedicated account manager',
    ],
    highlighted: false,
  },
]

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingPlanId, setPayingPlanId] = useState(null)
  const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' })

  const loadScript = (src) => new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/saas/plans`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) {
        setPlans(data.data.filter(p => p.status === 'Active'))
      }
    } catch {
      // Silently fallback to hardcoded plans
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (plan) => {
    // Check if user is logged in
    const token = getToken();
    if (!token) {
      setPaymentMessage({ type: 'info', text: 'Please login to your dashboard first to purchase a plan.' });
      setTimeout(() => setPaymentMessage({ type: '', text: '' }), 5000);
      return;
    }

    setPayingPlanId(plan._id);
    setPaymentMessage({ type: '', text: '' });

    try {
      if (!await loadScript('https://checkout.razorpay.com/v1/checkout.js')) {
        alert('Razorpay SDK failed to load.');
        setPayingPlanId(null);
        return;
      }

      const payRes = await fetch(`${config.apiUrl}/saas/payments/pay`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ planId: plan._id, billingCycle: plan.billing_cycle, amount: plan.price }),
      });
      const payData = await payRes.json();

      if (!payData.success) {
        alert(payData.message || 'Could not initiate payment');
        setPayingPlanId(null);
        return;
      }

      let userName = 'User', userEmail = 'user@example.com';
      try {
        const tok = getToken();
        if (tok) {
          const actual = tok.startsWith('Bearer ') ? tok.split(' ')[1] : tok;
          const decoded = JSON.parse(atob(actual.split('.')[1]));
          if (decoded.name) userName = decoded.name;
          if (decoded.email) userEmail = decoded.email;
        }
      } catch { /* silent */ }

      new window.Razorpay({
        key: payData.data.key_id,
        amount: payData.data.amount,
        currency: payData.data.currency,
        name: 'Digital Tech Solution',
        description: `Subscribe to ${plan.name} (${plan.billing_cycle})`,
        order_id: payData.data.orderId,
        handler: async (response) => {
          try {
            const vRes = await fetch(`${config.apiUrl}/saas/payments/verify`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ ...response, status: 'Success' }),
            });
            const vData = await vRes.json();
            if (vData.success) {
              setPaymentMessage({ type: 'success', text: '🎉 Payment successful! Your subscription is now active.' });
              setTimeout(() => setPaymentMessage({ type: '', text: '' }), 6000);
            } else {
              setPaymentMessage({ type: 'error', text: 'Payment verification failed. Please contact support.' });
            }
          } catch {
            setPaymentMessage({ type: 'error', text: 'Error during verification. Please contact support.' });
          } finally {
            setPayingPlanId(null);
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: () => setPayingPlanId(null) },
      }).open();
    } catch {
      alert('Error processing payment');
      setPayingPlanId(null);
    }
  }

  const services = [
    { name: 'Domain', price: '₹599 / yr', icon: Globe, desc: 'Secure your brand name with fast registration.' },
    { name: 'Hosting', price: '₹2,499 / yr', icon: Server, desc: 'Reliable, fast hosting with SSL & backups.' },
    { name: 'Website', price: 'From ₹14,999', icon: Globe, desc: 'Modern, responsive websites that convert.' },
    { name: 'SEO', price: 'From ₹5,999', icon: Cloud, desc: 'Improve visibility and organic traffic.' },
    { name: 'Mobile App', price: 'From ₹59,999', icon: Smartphone, desc: 'Native & cross-platform app development.' },
  ]

  // Use API plans if available, otherwise fallback to hardcoded
  const hasApiPlans = plans.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-950">
      {/* Hero — match main site hero theme and avoid navbar overlap */}
      <section
        id="pricing-hero"
        className="relative w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 pt-28 pb-16"
      >
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">Affordable Web Development &amp; Digital Solutions</h1>
          <p className="mt-3 text-gray-300 text-lg">We build beautiful, high-performing digital products that grow your business — without breaking the bank.</p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a href="#packages" className="inline-block px-6 py-3 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-500 hover:to-cyan-400">Get Started</a>
            <a href="#contact" className="inline-block px-6 py-3 rounded-md bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10">Contact Us</a>
          </div>
        </div>
      </section>

        {/* Services Pricing */}
        <section className="mt-6 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 dark:bg-slate-950 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Services & Pricing</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Pick individual services or choose a package for the best value.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.name} className="group relative rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:shadow-lg transition-shadow duration-200 dark:from-slate-900 dark:to-slate-950 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 dark:bg-indigo-800/20">
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">{s.name}</h3>
                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{s.price}</div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // Dynamic WhatsApp message for service inquiries
                        // Includes: current page name, service name, service category, and price
                        const message = `Hello, I'm interested in the ${s.name} service from the Services & Pricing page. The listed price is ${s.price}. Please share more details.`
                        openWhatsApp(message)
                      }}
                      className="inline-block text-xs font-medium text-indigo-600 hover:underline"
                    >
                      Buy / Enquire
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Payment Message Banner */}
        {paymentMessage.text && (
          <div className={`mx-4 mt-6 flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold border ${
            paymentMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
            paymentMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
          }`}>
            <ShieldCheck size={18} />
            {paymentMessage.text}
          </div>
        )}

        {/* Packages with Razorpay Payment Gateway */}
        <section id="packages" className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Packages</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Clear, predictable pricing for growing businesses.</p>
            </div>
            {hasApiPlans && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck size={14} /> Secure Payment
              </div>
            )}
          </div>

          {/* API Plans (with Razorpay) */}
          {hasApiPlans ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const PlanIcon = PLAN_ICONS[index % PLAN_ICONS.length];
                const isPopular = index === 1;

                return (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      isPopular
                        ? 'border-indigo-500 shadow-2xl scale-[1.02] ring-1 ring-indigo-500/20 bg-white dark:bg-slate-900'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300'
                    }`}
                  >
                    {isPopular && (
                      <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5 px-3">
                        ✦ Most Popular ✦
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      {/* Icon + Name */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPopular ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-gray-100 dark:bg-slate-800'}`}>
                          <PlanIcon size={18} className={isPopular ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
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
                          <CheckCircle2 size={15} className="text-indigo-500 shrink-0" />
                          <span>Up to <strong>{plan.max_users}</strong> Users</span>
                        </div>
                        {plan.features?.map((f, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle2 size={15} className="text-indigo-500 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button — Razorpay Payment */}
                      <button
                        onClick={() => handlePayment(plan)}
                        disabled={payingPlanId !== null}
                        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                          isPopular
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/30'
                            : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-md'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {payingPlanId === plan._id
                          ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Processing...</>
                          : <><ArrowUpRight size={15} /> Buy Now</>
                        }
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Fallback hardcoded cards (with WhatsApp) */
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {fallbackPackages.map((p) => (
                <FallbackPricingCard key={p.title} title={p.title} price={p.price} features={p.features} highlighted={p.highlighted} />
              ))}
            </div>
          )}
        </section>

        {/* contact section removed (per request) */}
    </div>
  )
}

// Fallback card component (WhatsApp based — used when API plans not available)
function FallbackPricingCard({ title, price, features, highlighted }) {
  // Derive package type from title
  function packageTypeFor(t) {
    const lower = String(t).toLowerCase()
    if (lower.includes('starter')) return 'Basic'
    if (lower.includes('business')) return 'Standard'
    if (lower.includes('premium')) return 'Premium'
    return 'Standard'
  }

  return (
    <div className={`relative transform transition-all duration-300 rounded-2xl p-6 md:p-8 bg-white border dark:bg-slate-950 ${highlighted ? 'border-indigo-500 shadow-2xl scale-105' : 'border-gray-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1'}`}>
      {highlighted && (
        <div className="absolute -top-3 right-4 inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow">Most Popular</div>
      )}

      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${highlighted ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{price}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">one-time / starting</div>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 text-sm text-gray-600">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xs">✓</span>
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <button
          onClick={() => {
            const pkgType = packageTypeFor(title)
            const message = `Hello, I'm interested in the ${title} plan (${pkgType}) from the Packages. The package price is ${price}. Please provide complete details.`
            openWhatsApp(message)
          }}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${highlighted ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md hover:opacity-95' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'}`}>
          Choose Plan
        </button>
      </div>
    </div>
  )
}
