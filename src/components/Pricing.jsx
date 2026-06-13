import React from 'react'
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

// Derive package type from title
function packageTypeFor(title) {
  const t = String(title).toLowerCase()
  if (t.includes('starter')) return 'Basic'
  if (t.includes('business')) return 'Standard'
  if (t.includes('premium')) return 'Premium'
  return 'Standard'
}
import { Globe, Server, Smartphone, Cloud } from 'lucide-react'

const PricingCard = ({ title, price, features, highlighted }) => {
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
            // Dynamic WhatsApp message for package inquiries
            // Includes: current page name, package name, package type, and price
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

export default function Pricing() {
  const packages = [
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

  const services = [
    { name: 'Domain', price: '₹599 / yr', icon: Globe, desc: 'Secure your brand name with fast registration.' },
    { name: 'Hosting', price: '₹2,499 / yr', icon: Server, desc: 'Reliable, fast hosting with SSL & backups.' },
    { name: 'Website', price: 'From ₹14,999', icon: Globe, desc: 'Modern, responsive websites that convert.' },
    { name: 'SEO', price: 'From ₹5,999', icon: Cloud, desc: 'Improve visibility and organic traffic.' },
    { name: 'Mobile App', price: 'From ₹59,999', icon: Smartphone, desc: 'Native & cross-platform app development.' },
  ]

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

        {/* Packages */}
        <section id="packages" className="mt-12 bg-white rounded-2xl p-6 md:p-8 border border-gray-100 dark:bg-slate-950 dark:border-slate-800">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Packages</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Clear, predictable pricing for growing businesses.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((p) => (
              <PricingCard key={p.title} title={p.title} price={p.price} features={p.features} highlighted={p.highlighted} />
            ))}
          </div>
        </section>

        {/* contact section removed (per request) */}
    </div>
  )
}
