import { motion } from 'framer-motion';
import { Code2, Cpu, Database, Globe } from 'lucide-react';

const iconItems = [
  { Icon: Code2, className: 'top-24 left-[8%]' },
  { Icon: Cpu, className: 'top-40 right-[10%]' },
  { Icon: Database, className: 'bottom-28 left-[12%]' },
  { Icon: Globe, className: 'bottom-20 right-[14%]' },
];

const TechBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        animate={{ x: [0, 24, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -18, 0], y: [0, 16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-300/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 14, 0], y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-cyan-200/20 blur-3xl"
      />

      <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,#3b82f6_1px,transparent_1px)] [background-size:22px_22px]" />

      {iconItems.map(({ Icon, className }, index) => (
        <motion.div
          key={index}
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute ${className} text-blue-500/20`}
        >
          <Icon size={44} />
        </motion.div>
      ))}
    </div>
  );
};

export default TechBackground;