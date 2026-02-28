import { motion } from 'framer-motion';
import { Users, Target, Award, TrendingUp, CheckCircle, Briefcase, Clock, ThumbsUp } from 'lucide-react';

const stats = [
  { icon: <Briefcase className="w-6 h-6 text-blue-500" />, value: '100+', label: 'Projects Completed' },
  { icon: <Users className="w-6 h-6 text-blue-500" />,     value: '50+',  label: 'Happy Clients'       },
  { icon: <Clock className="w-6 h-6 text-blue-500" />,     value: '5+',   label: 'Years Experience'    },
  { icon: <ThumbsUp className="w-6 h-6 text-blue-500" />,  value: '100%', label: 'Client Satisfaction' },
];

const highlights = [
  'Custom Websites, Apps & Software',
  'SEO & Digital Marketing',
  'Fast Delivery & Scalable Solutions',
  'Dedicated Post-Launch Support',
];

const values = [
  {
    icon: <Users className="w-7 h-7 text-blue-600" />,
    title: 'Client-First',
    description: 'We collaborate closely with every client to turn their vision into a high-performing digital product.',
  },
  {
    icon: <Target className="w-7 h-7 text-blue-600" />,
    title: 'Excellence',
    description: 'Pixel-perfect, scalable solutions — no shortcuts, every project gets our absolute best.',
  },
  {
    icon: <Award className="w-7 h-7 text-blue-600" />,
    title: 'Innovation',
    description: 'We stay ahead with the latest technologies to build fast, modern, and competitive products.',
  },
  {
    icon: <TrendingUp className="w-7 h-7 text-blue-600" />,
    title: 'ROI-Driven',
    description: 'Every solution we build is designed to attract customers, boost conversions, and grow revenue.',
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="relative section-padding overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 60%, #f1f5ff 100%)' }}
    >
      {/* Subtle decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* ── Section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            Who We Are
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              DigitalTechSolution
            </span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A results-driven digital agency specializing in websites, apps &amp; software that help
            businesses across India grow faster, attract more customers, and compete smarter.
          </p>
        </motion.div>

        {/* ── Mission + Stats ── */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">

          {/* Left — Mission copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">Our Mission</h3>
            <p className="text-gray-500 mb-5 leading-relaxed">
              To empower businesses with fast, scalable, and ROI-focused digital solutions —
              from idea to launch. We build websites, mobile apps, and custom software that
              reflect your brand, attract the right audience, and deliver measurable results.
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed">
              With 5+ years of experience and 50+ businesses trusted across India, we've helped
              brands achieve a lasting competitive edge through quality, innovation, and
              unwavering client focus.
            </p>

            {/* Highlight checklist */}
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — Stats cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-5">
              {stats.map(({ icon, value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(59,130,246,0.15)' }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm transition-all duration-300"
                >
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    {icon}
                  </div>
                  <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
                    {value}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Values ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our Core Values</h3>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: '0 16px 36px rgba(59,130,246,0.13)' }}
              className="group bg-white border border-gray-100 rounded-2xl p-7 text-center shadow-sm hover:border-blue-200 transition-all duration-300 cursor-default"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300 mb-5 mx-auto">
                {value.icon}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default About; 