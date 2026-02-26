import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, Users, Zap } from 'lucide-react';

const ServiceModal = ({ isOpen, onClose, service }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const ServiceIcon = service?.icon ?? null;

  const benefits = [
    { icon: <CheckCircle className="w-5 h-5 text-green-500" />, text: 'Custom Design & Development' },
    { icon: <Clock className="w-5 h-5 text-blue-500" />, text: 'Fast Delivery & Support' },
    { icon: <Users className="w-5 h-5 text-purple-500" />, text: 'Expert Team' },
    { icon: <Zap className="w-5 h-5 text-yellow-500" />, text: 'Modern Technologies' },
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {service && (
            <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {ServiceIcon
                    ? <ServiceIcon className="w-7 h-7 text-blue-600" />
                    : service.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {feature.icon}
                      <span className="text-gray-700 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies We Use</h3>
                <div className="flex flex-wrap gap-2">
                  {service.technologies?.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Process</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Discovery & Planning</h4>
                      <p className="text-gray-600 text-sm">We analyze your requirements and create a detailed project plan.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Design & Development</h4>
                      <p className="text-gray-600 text-sm">Our team creates stunning designs and develops your solution.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Testing & Launch</h4>
                      <p className="text-gray-600 text-sm">We thoroughly test and deploy your project with ongoing support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Close
                </motion.button>

                {/* WhatsApp button: sends dynamic message with selected service details */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    try {
                      const phoneNumber = '7983614392'; // WhatsApp contact (country code prefixed below)
                      const countryCode = '91';
                      const title = service.title || '';
                      const description = service.description || '';
                      const features = (service.features || []).join(', ');
                      const technologies = (service.technologies || []).join(', ');

                      const encoded = encodeURIComponent(`Hello! I'm interested in the ${title} service.\n\nOverview: ${description}\n\nFeatures: ${features}\n\nTechnologies: ${technologies}\n\nPlease get back to me with more details and pricing.`);

                      const whatsappUrl = `https://wa.me/${countryCode}${phoneNumber}?text=${encoded}`;
                      window.open(whatsappUrl, '_blank');
                    } catch (err) {
                      console.error('WhatsApp link error', err);
                    }
                  }}
                  className="flex-1 bg-green-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-600 transition-all duration-200"
                >
                  Message on WhatsApp
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 btn-primary"
                >
                  Get Started
                </motion.button>
              </div>
            </div>
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ServiceModal; 