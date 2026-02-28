import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Search, Code, BarChart3, Palette, ArrowRight, CheckCircle } from 'lucide-react';
import ServiceModal from './ServiceModal';

const services = [
  {
    icon: Globe,
    color: 'from-blue-500 to-cyan-400',
    badge: 'bg-blue-50 text-blue-600 border-blue-100',
    title: 'Static Website Development',
    description: 'Fast, secure, and cost-effective websites built with React, Next.js, and Gatsby — optimized for speed and SEO from day one.',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Easy Maintenance'],
    technologies: ['React', 'Next.js', 'Gatsby', 'HTML5', 'CSS3', 'JavaScript'],
  },
  {
    icon: Code,
    color: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: 'Dynamic Website Development',
    description: 'Full-featured web applications with databases, authentication, and complex functionality tailored to your business logic.',
    features: ['Custom Backend', 'Database Integration', 'User Management', 'API Development'],
    technologies: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS'],
  },
  {
    icon: Search,
    color: 'from-emerald-500 to-teal-400',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'SEO Optimization',
    description: 'Dominate search rankings and drive high-quality organic traffic with proven on-page, off-page, and technical SEO strategies.',
    features: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Performance Optimization'],
    technologies: ['Google Analytics', 'Search Console', 'SEMrush', 'Ahrefs', 'Core Web Vitals'],
  },
  {
    icon: Smartphone,
    color: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-50 text-violet-600 border-violet-100',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile apps for iOS & Android that deliver exceptional performance and user experience.',
    features: ['iOS Development', 'Android Development', 'Cross-Platform', 'App Store Optimization'],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'App Store Connect'],
  },
  {
    icon: BarChart3,
    color: 'from-orange-500 to-amber-400',
    badge: 'bg-orange-50 text-orange-600 border-orange-100',
    title: 'Digital Marketing',
    description: 'ROI-focused digital marketing campaigns — from social ads to content strategy — that grow your audience and revenue.',
    features: ['Social Media Marketing', 'Content Marketing', 'PPC Advertising', 'Analytics & Reporting'],
    technologies: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Mailchimp', 'Hootsuite', 'Google Analytics'],
  },
  {
    icon: Palette,
    color: 'from-pink-500 to-rose-400',
    badge: 'bg-pink-50 text-pink-600 border-pink-100',
    title: 'UI/UX Design',
    description: 'Beautiful, intuitive interfaces backed by user research and prototyping — designs that convert visitors into customers.',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle', 'Adobe Creative Suite'],
  },
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLearnMore = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing service so the modal exit animation can complete
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <section
      id="services"
      className="relative section-padding overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f1f5ff 0%, #f8faff 50%, #ffffff 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-indigo-100 rounded-full opacity-35 blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="container-custom relative z-10">

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            End-to-end digital solutions — from design to deployment — that drive real business growth.
          </p>
        </motion.div>

        {/* ── Service Cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: index * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, boxShadow: '0 20px 48px rgba(59,130,246,0.13)' }}
                className="group bg-white border border-gray-100 rounded-2xl p-7 shadow-sm flex flex-col transition-all duration-300 hover:border-blue-200"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} shadow-md mb-5`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {service.description}
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${service.badge}`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Learn More */}
                <div className="mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLearnMore(service)}
                    className="inline-flex items-center gap-2 w-full justify-center py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all duration-300"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── CTA Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-blue-950 px-8 py-14 text-center text-white shadow-2xl">
            {/* dot grid */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {/* glow orbs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500 rounded-full opacity-15 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-400 rounded-full opacity-15 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-block bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
                Let's Work Together
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                Ready to Build Something Great?
              </h3>
              <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto mb-8 leading-relaxed">
                Tell us about your project — we'll turn your idea into a fast, scalable solution that drives real ROI.
              </p>
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: '0 16px 40px rgba(59,130,246,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 px-9 rounded-xl transition-all duration-300 shadow-lg text-base"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </section>
  );
};

export default Services; 