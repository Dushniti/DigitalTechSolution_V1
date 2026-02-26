import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from 'lucide-react';
import config from '../config';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [scheduleData, setScheduleData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    purpose: ''
  });
  const [projectData, setProjectData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    budget: '',
    timeline: '',
    requirements: ''
  });
  const [getStartedData, setGetStartedData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    budget: '',
    startDate: '',
    message: ''
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Name is required' });
      return false;
    }
    if (!formData.phone.trim()) {
      setStatus({ type: 'error', message: 'Phone number is required' });
      return false;
    }
    // Phone number validation (accepts common formats with optional country code)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid phone number' });
      return false;
    }
    // Email validation only if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setStatus({ type: 'error', message: 'Please enter a valid email address' });
        return false;
      }
    }
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Message is required' });
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear status when user starts typing
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
  };

  const handleScheduleChange = (e) => {
    setScheduleData({
      ...scheduleData,
      [e.target.name]: e.target.value
    });
  };

  const handleProjectChange = (e) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value
    });
  };

  const handleGetStartedChange = (e) => {
    setGetStartedData({
      ...getStartedData,
      [e.target.name]: e.target.value
    });
  };

  const handleGetStartedSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/get-started', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(getStartedData)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: 'Thank you for your interest! We will get back to you shortly.' });
        setGetStartedData({
          name: '',
          email: '',
          phone: '',
          interest: '',
          budget: '',
          startDate: '',
          message: ''
        });
        setShowGetStartedModal(false);
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Failed to submit request. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${config.apiUrl}/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(projectData)
      });

      // First check if the request was successful
      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check server configuration.');
        }
        if (response.status === 500) {
          throw new Error('Internal server error. Please try again later.');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStatus({ 
          type: 'success', 
          message: 'Project request submitted successfully! We will contact you shortly.' 
        });
        setProjectData({
          name: '',
          email: '',
          phone: '',
          company: '',
          projectType: '',
          budget: '',
          timeline: '',
          requirements: ''
        });
        setShowProjectModal(false);
      } else {
        // Handle application-level errors
        setStatus({ 
          type: 'error', 
          message: data.message || 'Failed to submit project request. Please try again.'
        });
      }
    } catch (error) {
      console.error('Project submission error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to submit project request. ';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        errorMessage += 'Cannot connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('API endpoint not found')) {
        errorMessage += 'Service is temporarily unavailable. Please try again in a few minutes.';
      } else if (error.message.includes('Internal server error')) {
        errorMessage += 'Server encountered an error. Our team has been notified.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }

      setStatus({ 
        type: 'error', 
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${config.apiUrl}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(scheduleData)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: 'Call scheduled successfully! We will contact you shortly.' });
        setScheduleData({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          purpose: ''
        });
        setShowScheduleModal(false);
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Failed to schedule call. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${config.apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      color: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-50',
      title: 'Email Us',
      info: 'dushyant.kumar1719@gmail.com',
      link: 'mailto:dushyant.kumar1719@gmail.com',
    },
    {
      icon: Phone,
      color: 'from-emerald-500 to-teal-400',
      bg: 'bg-emerald-50',
      title: 'Call Us',
      info: '+91 7983614392',
      link: 'tel:+917983614392',
    },
    {
      icon: MapPin,
      color: 'from-violet-500 to-purple-400',
      bg: 'bg-violet-50',
      title: 'Our Location',
      info: 'Ram Ghat Road, Aligarh (202001)',
      link: '#',
    },
  ];

  const businessHours = [
    { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
    { day: 'Saturday',        time: '10:00 AM - 4:00 PM' },
    { day: 'Sunday',          time: 'Closed' },
  ];

  return (
    <section
      id="contact"
      className="relative section-padding overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f1f5ff 0%, #f8faff 50%, #ffffff 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full opacity-35 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* â”€â”€ Heading â”€â”€ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            Contact Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Get In{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Ready to start your next project? We'd love to hear from you — send us a message and we'll respond promptly.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* â”€â”€ Contact Form â”€â”€ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
            viewport={{ once: true }}
          >
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Send Us a Message</h3>
              <p className="text-gray-500 text-sm mb-6">We typically reply within a few hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {status.message && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${
                    status.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {status.message}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 resize-none text-sm"
                    placeholder="Tell us about your project or how we can help..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? '' : '0 8px 24px rgba(59,130,246,0.35)' }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-md shadow-blue-200 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* â”€â”€ Right Column: Info + Hours â”€â”€ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Reach out via any of the channels below — we're always happy to help.
              </p>
            </div>

            {/* Contact cards */}
            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={index}
                    href={item.link}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{item.title}</p>
                      <p className="text-gray-800 font-medium text-sm group-hover:text-blue-600 transition-colors duration-200">{item.info}</p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Business Hours */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Business Hours</h4>
              </div>
              <div className="space-y-2.5">
                {businessHours.map(({ day, time }) => (
                  <div key={day} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{day}</span>
                    <span className={`font-semibold ${time === 'Closed' ? 'text-red-400' : 'text-gray-800'}`}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* â”€â”€ CTA Banner â”€â”€ */}
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
                Let's Get Started
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                Ready to Start Your Project?
              </h3>
              <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto mb-8 leading-relaxed">
                Let's discuss your ideas and turn them into a fast, scalable digital solution that drives real results.
              </p>
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: '0 16px 40px rgba(59,130,246,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowProjectModal(true)}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 px-9 rounded-xl transition-all duration-300 shadow-lg text-base"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* â”€â”€ Project Modal â”€â”€ */}
        {showProjectModal && createPortal(
          <div className="fixed inset-x-0 bottom-0 top-16 lg:top-[70px] bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-full overflow-y-auto shadow-2xl"
            >
              {/* Modal header */}
              <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-blue-950 rounded-t-2xl px-8 py-6">
                <div className="absolute inset-0 opacity-[0.06] rounded-t-2xl pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl pointer-events-none" />
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">New Enquiry</p>
                    <h3 className="text-xl font-extrabold text-white">Start Your Project</h3>
                  </div>
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form body */}
              <div className="px-8 py-7">
                <form onSubmit={handleProjectSubmit} className="space-y-5">
                  {status.message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {status.message}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" value={projectData.name} onChange={handleProjectChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={projectData.email} onChange={handleProjectChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                      <input type="tel" name="phone" value={projectData.phone} onChange={handleProjectChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" name="company" value={projectData.company} onChange={handleProjectChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" placeholder="Your company name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Type <span className="text-red-500">*</span></label>
                    <select name="projectType" value={projectData.projectType} onChange={handleProjectChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all">
                      <option value="">Select project type</option>
                      <option value="website">Website Development</option>
                      <option value="webapp">Web Application</option>
                      <option value="mobileapp">Mobile Application</option>
                      <option value="ecommerce">E-commerce Solution</option>
                      <option value="custom">Custom Software</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget Range <span className="text-red-500">*</span></label>
                      <select name="budget" value={projectData.budget} onChange={handleProjectChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all">
                        <option value="">Select budget range</option>
                        <option value="less-5k">Less than ₹5,000</option>
                        <option value="5k-10k">₹5,000 – ₹10,000</option>
                        <option value="10k-25k">₹10,000 – ₹25,000</option>
                        <option value="25k-50k">₹25,000 – ₹50,000</option>
                        <option value="more-50k">More than ₹50,000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expected Timeline <span className="text-red-500">*</span></label>
                      <select name="timeline" value={projectData.timeline} onChange={handleProjectChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all">
                        <option value="">Select timeline</option>
                        <option value="less-1m">Less than 1 month</option>
                        <option value="1-3m">1-3 months</option>
                        <option value="3-6m">3-6 months</option>
                        <option value="more-6m">More than 6 months</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Requirements <span className="text-red-500">*</span></label>
                    <textarea name="requirements" value={projectData.requirements} onChange={handleProjectChange} required rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all resize-none" placeholder="Describe your project goals and key features..." />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? '' : '0 8px 24px rgba(59,130,246,0.35)' }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    disabled={loading}
                    className={`w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-md shadow-blue-200 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></>
                    ) : (
                      <><Send size={16} />Submit Project Request</>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        , document.body)}

        {/* Schedule Modal */}
        {showScheduleModal && createPortal(
          <div className="fixed inset-x-0 bottom-0 top-16 lg:top-[70px] bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full max-h-full overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Schedule a Call</h3>
                <button onClick={() => setShowScheduleModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                  <input type="text" name="name" value={scheduleData.name} onChange={handleScheduleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="email" value={scheduleData.email} onChange={handleScheduleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" name="phone" value={scheduleData.phone} onChange={handleScheduleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date</label>
                  <input type="date" name="date" value={scheduleData.date} onChange={handleScheduleChange} required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Time</label>
                  <select name="time" value={scheduleData.time} onChange={handleScheduleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all">
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose of Call</label>
                  <textarea name="purpose" value={scheduleData.purpose} onChange={handleScheduleChange} required rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-sm transition-all resize-none" placeholder="Briefly describe what you'd like to discuss..." />
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-md shadow-blue-200 transition-all duration-300">
                  {loading ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Scheduling...</span></div> : 'Schedule Call'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        , document.body)}

      </div>
    </section>
  );
};

export default Contact;
