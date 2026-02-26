import { motion } from 'framer-motion';
import TechBackground from './TechBackground';
import { Github, Linkedin, Mail } from 'lucide-react';

const team = [
 {
    name: 'Nitika Jolly',
    role: 'Frontend Developer',
    bio: 'Creates beautiful, intuitive interfaces that put user experience first and turn visitors into loyal customers.',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=7c3aed&textColor=ffffff',
    socials: {
      linkedin: '#',
      github: '#',
      email: 'niti.digitech19@gmail.com',
    },
  },
  {
    name: 'Dushyant Kumar',
    role: 'Founder & Full-Stack Developer',
    bio: 'Leads the vision and development of DigitalTechSolution with 5+ years of experience building scalable web and mobile products.',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK&backgroundColor=1d4ed8&textColor=ffffff',
    socials: {
      linkedin: '#',
      github: '#',
      email: 'dushyant.kumar1719@gmail.com',
    },
  },
  {
    name: 'Ishu Mathur',
    role: 'Backend Developer',
    bio: 'Builds rock-solid APIs and cloud infrastructure that power high-performance applications at any scale.',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RV&backgroundColor=059669&textColor=ffffff',
    socials: {
      linkedin: '#',
      github: '#',
      email: 'ishu.mathur@gmail.com',
    },
  }
//   ,
//   {
//     name: 'Anjali Singh',
//     role: 'Digital Marketing Specialist',
//     bio: 'Drives organic growth and measurable ROI through data-driven SEO, content, and paid-campaign strategies.',
//     avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=db2777&textColor=ffffff',
//     socials: {
//       linkedin: '#',
//       github: '#',
//       email: 'dushyant.kumar1719@gmail.com',
//     },
//   },
//   {
//     name: 'Amit Yadav',
//     role: 'Mobile App Developer',
//     bio: 'Crafts polished iOS and Android experiences with React Native and Flutter that users love.',
//     avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AY&backgroundColor=d97706&textColor=ffffff',
//     socials: {
//       linkedin: '#',
//       github: '#',
//       email: 'dushyant.kumar1719@gmail.com',
//     },
//   },
//   {
//     name: 'Neha Gupta',
//     role: 'Project Manager',
//     bio: 'Keeps every project on track, on time, and on budget — ensuring smooth delivery and happy clients.',
//     avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NG&backgroundColor=0891b2&textColor=ffffff',
//     socials: {
//       linkedin: '#',
//       github: '#',
//       email: 'dushyant.kumar1719@gmail.com',
//     },
//   },
];

const OurTeam = () => {
  return (
    <section className="relative pt-24 pb-16 min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <TechBackground />
      <div className="relative z-10 container-custom px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg p-6 sm:p-10 mb-10 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Meet Our Team
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A passionate group of designers, developers, and strategists dedicated to building
            digital products that make a real difference.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.09 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(59,130,246,0.12)' }}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 flex flex-col items-center text-center transition-all duration-300"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full mb-4 ring-4 ring-blue-100"
              />
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">{member.name}</h2>
              <p className="text-sm font-semibold text-blue-600 mb-3">{member.role}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{member.bio}</p>

              {/* Socials */}
              <div className="flex items-center gap-3 mt-auto">
                <a
                  href={member.socials.linkedin}
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200"
                >
                  <Linkedin size={15} />
                </a>
                <a
                  href={member.socials.github}
                  aria-label="GitHub"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-800 hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200"
                >
                  <Github size={15} />
                </a>
                <a
                  href={`mailto:${member.socials.email}`}
                  aria-label="Email"
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-500 flex items-center justify-center transition-all duration-200"
                >
                  <Mail size={15} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
