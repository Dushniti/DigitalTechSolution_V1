import { motion } from 'framer-motion';
import TechBackground from './TechBackground';

const Career = () => {
  const openings = [
    {
      title: 'Frontend Developer (React)',
      type: 'Full Time',
      location: 'Aligarh / Remote',
      experience: '1-3 Years',
      description:
        'Build responsive and high-performance web interfaces using React, Tailwind CSS, and modern frontend best practices.',
    },
    {
      title: 'Backend Developer (Node.js)',
      type: 'Full Time',
      location: 'Aligarh / Remote',
      experience: '2-4 Years',
      description:
        'Develop scalable APIs, manage databases, and improve backend performance for client projects.',
    },
    {
      title: 'Digital Marketing Specialist',
      type: 'Full Time',
      location: 'Aligarh',
      experience: '1-3 Years',
      description:
        'Plan and execute SEO, social media, and paid campaigns to drive measurable business growth.',
    },
  ];

  return (
    <section className="relative pt-24 pb-16 min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <TechBackground />
      <div className="relative z-10 container-custom px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg p-6 sm:p-10 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Career Opportunities
          </h1>
          <p className="text-gray-600 text-lg">
            Join DigitalTechSolution and help us create impactful digital experiences.
          </p>
        </motion.div>

        <div className="space-y-5">
          {openings.map((job, index) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-xl bg-white border border-blue-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h2>
              <div className="flex flex-wrap gap-3 mb-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">{job.type}</span>
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">{job.location}</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">{job.experience}</span>
              </div>
              <p className="text-gray-700 mb-5 leading-relaxed">{job.description}</p>
              <a
                href={`mailto:dushyant.kumar1719@gmail.com?subject=${encodeURIComponent(`Application for ${job.title}`)}`}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                Apply Now
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Career;