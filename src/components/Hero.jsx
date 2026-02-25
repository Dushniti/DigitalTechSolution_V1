import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, CheckCircle, Star } from 'lucide-react';

const phoneNumber = '7983614392';

const stats = [
  { value: '100+', label: 'Projects Completed' },
  { value: '50+', label: 'Happy Clients' },
  { value: '5+', label: 'Years Experience' },
];

const benefits = [
  'Custom Web & App Development',
  'SEO & Digital Marketing',
  'Dedicated Support Team',
];

// Pre-computed particle data – deterministic so no re-render cost
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: 2 + (i % 3),                        // 2 | 3 | 4 px
  left: `${(i * 37 + 11) % 100}%`,
  top:  `${(i * 53 +  7) % 100}%`,
  duration: `${7 + (i % 6) * 1.8}s`,        // 7 – 16 s
  delay:    `${-((i * 1.3) % 8)}s`,          // stagger with negative delay (starts mid-animation)
  opacity:  0.12 + (i % 5) * 0.04,           // 0.12 – 0.28
}));

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
};

const Hero = () => {
  const [cursor, setCursor] = useState({ x: -999, y: -999 });

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursor({ x: -999, y: -999 });
  }, []);

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900"
    >
      {/* ── Layered gradient overlays ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Radial centre spotlight */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        {/* Bottom-left teal glow */}
        <div className="absolute bottom-0 left-0 w-[36rem] h-[36rem] bg-cyan-600 rounded-full opacity-[0.07] blur-3xl" />
        {/* Top-right indigo glow */}
        <div className="absolute -top-32 right-0 w-[32rem] h-[32rem] bg-indigo-600 rounded-full opacity-[0.10] blur-3xl" />
      </div>

      {/* ── Dot-grid texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.045]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── Top border glow ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent pointer-events-none" />

      {/* ── Glowing cursor follower ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 380,
          height: 380,
          left: cursor.x,
          top: cursor.y,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99,179,237,0.18) 0%, rgba(59,130,246,0.10) 40%, transparent 70%)',
          filter: 'blur(32px)',
          transition: 'left 0.08s ease-out, top 0.08s ease-out',
          zIndex: 1,
        }}
      />

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-blue-400"
            style={{
              width:  p.size,
              height: p.size,
              left:   p.left,
              top:    p.top,
              '--p-opacity': p.opacity,
              opacity: p.opacity,
              animation: `particleFloat ${p.duration} ${p.delay} ease-in-out infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Trust badge */}
          <motion.div variants={fadeUp} className="mb-7">
            <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full tracking-wide">
              <Star size={13} className="fill-blue-400 text-blue-400" />
              Trusted by 50+ Businesses Across India
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold text-white leading-[1.12] tracking-tight mb-6 max-w-4xl"
          >
            We Build{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              Websites, Apps &amp; Software
            </span>{' '}
            That Grow Your Business
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-gray-300/90 max-w-2xl mb-8 leading-relaxed"
          >
            From idea to launch — we deliver fast, scalable, and ROI‑focused digital solutions
            that attract more customers, boost conversions, and give your business a lasting
            competitive edge.
          </motion.p>

          {/* Benefit pills */}
          <motion.ul
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10"
          >
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-1.5 text-sm text-gray-300">
                <CheckCircle size={15} className="text-cyan-400 shrink-0" />
                {b}
              </li>
            ))}
          </motion.ul>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
          >
            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59,130,246,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 text-[0.95rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Get Free Consultation
              <ArrowRight size={18} />
            </motion.button>

            {/* Secondary CTA */}
            <motion.a
              href={`tel:+91${phoneNumber}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 text-[0.95rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Phone size={17} className="text-cyan-400" />
              Call Now
            </motion.a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-6 sm:gap-14 max-w-md mx-auto w-full"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  {value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 leading-snug">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Animated wave SVG ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-[0]"
        aria-hidden="true"
        style={{ height: 110 }}
      >
        {/* Back wave – slower, more transparent */}
        <div
          className="absolute bottom-0 left-0 h-full"
          style={{
            width: '200%',
            animation: 'waveShift 18s linear infinite',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 1440 110"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-1/2 h-full inline-block"
          >
            <path
              d="M0,55 C180,100 360,10 540,55 C720,100 900,10 1080,55 C1260,100 1350,30 1440,55 L1440,110 L0,110 Z"
              fill="rgba(255,255,255,0.06)"
            />
          </svg>
          <svg
            viewBox="0 0 1440 110"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-1/2 h-full inline-block"
          >
            <path
              d="M0,55 C180,100 360,10 540,55 C720,100 900,10 1080,55 C1260,100 1350,30 1440,55 L1440,110 L0,110 Z"
              fill="rgba(255,255,255,0.06)"
            />
          </svg>
        </div>

        {/* Front wave – faster, matches next section bg */}
        <div
          className="absolute bottom-0 left-0 h-full"
          style={{
            width: '200%',
            animation: 'waveShift 11s linear infinite reverse',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 1440 110"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-1/2 h-full inline-block"
          >
            <path
              d="M0,70 C200,20 400,100 600,60 C800,20 1000,90 1200,50 C1300,30 1380,80 1440,70 L1440,110 L0,110 Z"
              fill="#ffffff"
            />
          </svg>
          <svg
            viewBox="0 0 1440 110"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-1/2 h-full inline-block"
          >
            <path
              d="M0,70 C200,20 400,100 600,60 C800,20 1000,90 1200,50 C1300,30 1380,80 1440,70 L1440,110 L0,110 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
