import { motion } from 'framer-motion';
import TechBackground from './TechBackground';

const TermsOfService = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      description:
        'By accessing or using our website and services, you agree to be bound by these terms and all applicable laws and regulations.',
    },
    {
      title: 'Services',
      description:
        'DigitalTechSolution provides web and digital services based on agreed project scopes, timelines, and deliverables communicated with clients.',
    },
    {
      title: 'Intellectual Property',
      description:
        'All website content, branding, and materials are owned by DigitalTechSolution unless otherwise stated. Unauthorized use is prohibited.',
    },
    {
      title: 'Limitation of Liability',
      description:
        'We are not liable for indirect, incidental, or consequential damages arising from the use of our website or services, to the extent permitted by law.',
    },
    {
      title: 'Changes to Terms',
      description:
        'We may update these terms from time to time. Continued use of our website after updates means you accept the revised terms.',
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
            Terms of Service
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
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;