import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TechBackground from './TechBackground';
import config from '../config';

const JobCard = ({ job, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Header section (always visible) */}
      <div 
        className="p-6 cursor-pointer flex justify-between items-start sm:items-center gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{job.title}</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">{job.employmentType}</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">{job.location}</span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">{job.experience}</span>
          </div>
        </div>
        <button 
          className="p-2 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title={isExpanded ? 'Collapse Details' : 'View Details'}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Details section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-slate-800"
          >
            <div className="p-6 pt-4 bg-gray-50/50 dark:bg-slate-800/20">
              <div 
                className="text-gray-700 dark:text-gray-300 mb-6 prose prose-blue dark:prose-invert max-w-none prose-sm sm:prose-base"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              <a
                href={`mailto:dushyant.kumar1719@gmail.com?subject=${encodeURIComponent(`Application for ${job.title}`)}`}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
              >
                Apply Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Career = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActiveJobs = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/jobs?status=Active&limit=50`);
        const data = await res.json();
        if (data.success) {
          setOpenings(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch job openings.');
        }
      } catch (err) {
        setError('Unable to load jobs at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveJobs();
  }, []);

  return (
    <section className="relative pt-24 pb-16 min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <TechBackground />
      <div className="relative z-10 container-custom px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-blue-100 dark:border-slate-700 shadow-lg p-6 sm:p-10 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Career Opportunities
          </h1>
          <p className="text-gray-600 text-lg">
            Join DigitalTechSolution and help us create impactful digital experiences.
          </p>
        </motion.div>

        <div className="space-y-5">
          {loading ? (
            // Skeleton Loader
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="flex gap-3 mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-24"></div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
              </div>
            ))
          ) : error ? (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : openings.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Open Positions Available Right Now</h3>
              <p className="text-gray-500 dark:text-gray-400">Please check back later or follow us on our social media for future updates.</p>
            </div>
          ) : (
            openings.map((job, index) => (
              <JobCard key={job._id} job={job} index={index} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Career;