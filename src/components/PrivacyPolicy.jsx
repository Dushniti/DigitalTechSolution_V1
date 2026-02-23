import { motion } from 'framer-motion';
import TechBackground from './TechBackground';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      description:
        'We may collect personal details you provide through our contact forms, such as your name, email address, phone number, and project requirements.',
    },
    {
      title: 'How We Use Information',
      description:
        'We use your information to respond to inquiries, provide requested services, improve our website experience, and communicate relevant updates.',
    },
    {
      title: 'Data Security',
      description:
        'We take reasonable technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction.',
    },
    {
      title: 'Third-Party Services',
      description:
        'We may use trusted third-party tools for analytics, hosting, or communication. Their use of data is governed by their respective privacy policies.',
    },
  ];

  return (
    <section className="relative pt-24 pb-16 min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <TechBackground />
      <div className="relative z-10 container-custom px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg p-6 sm:p-10 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: February 23, 2026</p>
        </motion.div>

        <div className="space-y-5 text-gray-700 leading-relaxed">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-xl bg-white border border-blue-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <p>{section.description}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6"
          >
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, contact us at{' '}
              <a
                href="mailto:dushyant.kumar1719@gmail.com"
                className="font-semibold text-white underline underline-offset-4 hover:text-blue-100"
              >
                dushyant.kumar1719@gmail.com
              </a>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;