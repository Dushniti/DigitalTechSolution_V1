import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';
import { useState } from 'react';
import './Hero.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: 'linear',
    arrows: false,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const heroContent = [
    {
      title: <>We Build<span className="text-blue-300 block">Digital Experiences</span>That Matter</>,
      description: "Transform your business with cutting-edge web solutions. We specialize in creating stunning, high-performance websites and applications that drive results."
    },
    {
      title: <>Drive Growth With<span className="text-blue-300 block">Digital Marketing</span>That Delivers</>,
      description: "Boost your online presence with data-driven digital marketing strategies. We help you reach and engage your target audience effectively."
    },
    {
      title: <>Innovative<span className="text-blue-300 block">Mobile Apps</span>For Your Business</>,
      description: "Transform your ideas into powerful mobile applications. We develop custom solutions that engage users and drive business growth."
    }
  ];

  const bannerImages = [
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop",
      alt: "Web Development Banner"
    },
    {
      url: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1920&h=1080&fit=crop",
      alt: "Digital Marketing Banner"
    },
    {
      url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&h=1080&fit=crop",
      alt: "App Development Banner"
    }
  ];
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <Slider {...sliderSettings} className="h-full">
          {bannerImages.map((image, index) => (
            <div key={index} className="h-screen">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/60"></div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="container-custom relative z-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            {heroContent[currentSlide].title}
          </motion.h1>

          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {heroContent[currentSlide].description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center space-x-2"
              onClick={() => {
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              onClick={() => {
                document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Our Work
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300 mb-2">100+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300 mb-2">50+</div>
              <div className="text-blue-100">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300 mb-2">5+</div>
              <div className="text-blue-100">Years Experience</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 