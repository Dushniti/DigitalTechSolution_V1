import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

const projects = [
  {
    title: 'E-Commerce Platform',
    category: 'Web Development',
    description: 'Full-featured e-commerce platform with payment integration, inventory management, and admin dashboard.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    liveUrl: '#',
    githubUrl: '#',
    accent: 'from-blue-600 to-cyan-500',
  },
  {
    title: 'Restaurant Website',
    category: 'Static Website',
    description: 'Modern, responsive website for a fine dining restaurant with online reservations and menu showcase.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
    liveUrl: '#',
    githubUrl: '#',
    accent: 'from-orange-500 to-amber-400',
  },
  {
    title: 'Fitness App',
    category: 'Mobile Development',
    description: 'Cross-platform mobile app for fitness tracking with workout plans and progress monitoring.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    technologies: ['React Native', 'Firebase', 'Redux'],
    liveUrl: '#',
    githubUrl: '#',
    accent: 'from-violet-600 to-purple-500',
  },
  {
    title: 'Corporate Dashboard',
    category: 'Web Application',
    description: 'Analytics dashboard with real-time data visualization and reporting tools for enterprise clients.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    technologies: ['Vue.js', 'D3.js', 'Express.js', 'PostgreSQL'],
    liveUrl: '#',
    githubUrl: '#',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    title: 'Travel Blog',
    category: 'Content Website',
    description: 'Beautiful travel blog with stunning photography, interactive maps, and booking integration.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    technologies: ['Gatsby', 'GraphQL', 'Contentful', 'Netlify'],
    liveUrl: '#',
    githubUrl: '#',
    accent: 'from-pink-500 to-rose-400',
  },
  {
    title: 'SaaS Platform',
    category: 'Web Application',
    description: 'Software-as-a-Service platform with subscription management, user authentication, and API integration.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    technologies: ['React', 'Django', 'AWS', 'Docker'],
    liveUrl: '#',
    githubUrl: '#',
    accent: 'from-indigo-600 to-blue-500',
  },
];

const categories = ['All', 'Web Development', 'Static Website', 'Mobile Development', 'Web Application', 'Content Website'];

const Portfolio = () => {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active);

  return (
    <section
      id="portfolio"
      className="relative section-padding overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 50%, #f1f5ff 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-indigo-100 rounded-full opacity-35 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            What We've Built
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Real projects, real results — see how we've helped businesses across India build a stronger digital presence.
          </p>
        </motion.div>

        {/* ── Filter Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
                active === cat
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Projects Grid ── */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                whileHover={{ y: -8, boxShadow: '0 20px 48px rgba(59,130,246,0.13)' }}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end gap-3 p-4">
                    <a
                      href={project.liveUrl}
                      onClick={e => e.stopPropagation()}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/40 transition-colors duration-200"
                      title="Live Demo"
                    >
                      <ExternalLink size={17} />
                    </a>
                    <a
                      href={project.githubUrl}
                      onClick={e => e.stopPropagation()}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/40 transition-colors duration-200"
                      title="View Code"
                    >
                      <Github size={17} />
                    </a>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`bg-gradient-to-r ${project.accent} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm`}>
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                    {project.description}
                  </p>
                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

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
              <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                Have a Project in Mind?
              </h3>
              <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto mb-8 leading-relaxed">
                Let's build something great together — from concept to launch, we've got you covered.
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
    </section>
  );
};

export default Portfolio;