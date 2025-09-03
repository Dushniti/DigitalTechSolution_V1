import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Search, Code, BarChart3, Palette } from 'lucide-react';
import ServiceModal from './ServiceModal';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: 'Static Website Development',
      description: 'Fast, secure, and cost-effective static websites built with modern technologies like React, Next.js, and Gatsby.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Easy Maintenance'],
      technologies: ['React', 'Next.js', 'Gatsby', 'HTML5', 'CSS3', 'JavaScript']
    },
    {
      icon: <Code className="w-12 h-12 text-blue-600" />,
      title: 'Dynamic Website Development',
      description: 'Full-featured web applications with databases, user authentication, and complex functionality.',
      features: ['Custom Backend', 'Database Integration', 'User Management', 'API Development'],
      technologies: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS']
    },
    {
      icon: <Search className="w-12 h-12 text-blue-600" />,
      title: 'SEO Optimization',
      description: 'Improve your website\'s visibility in search engines and drive more organic traffic to your business.',
      features: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Performance Optimization'],
      technologies: ['Google Analytics', 'Google Search Console', 'SEMrush', 'Ahrefs', 'Core Web Vitals']
    },
    {
      icon: <Smartphone className="w-12 h-12 text-blue-600" />,
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications that provide exceptional user experiences.',
      features: ['iOS Development', 'Android Development', 'Cross-Platform', 'App Store Optimization'],
      technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'App Store Connect']
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
      title: 'Digital Marketing',
      description: 'Comprehensive digital marketing strategies to grow your online presence and reach your target audience.',
      features: ['Social Media Marketing', 'Content Marketing', 'PPC Advertising', 'Analytics & Reporting'],
      technologies: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Mailchimp', 'Hootsuite', 'Google Analytics']
    },
    {
      icon: <Palette className="w-12 h-12 text-blue-600" />,
      title: 'UI/UX Design',
      description: 'Beautiful, intuitive user interfaces and seamless user experiences that convert visitors into customers.',
      features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
      technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle', 'Adobe Creative Suite']
    }
  ];

  const handleLearnMore = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer a comprehensive range of web development and digital services 
            to help your business succeed online.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-center mb-6">
                {service.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 text-center leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLearnMore(service)}
                className="w-full mt-6 btn-primary"
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 opacity-90">
              Let's discuss your project and create something amazing together.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all duration-300"
            >
              Start Your Project
            </motion.button>
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