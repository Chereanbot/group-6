"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { HiOutlineScale, HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineChevronRight, HiOutlineLightBulb, HiOutlineShieldCheck } from 'react-icons/hi';

const slides = [
  {
    title: "Justice For All",
    subtitle: "Expert Legal Aid at Your Service",
    description: "Empowering the community with professional legal assistance and guidance",
    image: "/images/hero/justice.jpg",
    overlayImage: "/images/hero/scales-overlay.png",
    cta: "Get Legal Help",
    color: "from-blue-600/20 via-transparent to-transparent",
    icon: <HiOutlineScale className="w-8 h-8" />,
    accent: "blue"
  },
  {
    title: "Community Support",
    subtitle: "Accessible Legal Services",
    description: "Providing legal aid to vulnerable communities regardless of financial status",
    image: "/images/hero/consultation.jpg",
    overlayImage: "/images/hero/consultation_overlay.png",
    cta: "Our Services",
    color: "from-primary-600/20 via-transparent to-transparent",
    icon: <HiOutlineUserGroup className="w-8 h-8" />,
    accent: "primary"
  },
  {//developers
    title: "our developers",
    subtitle: "Know Your Rights",
    description: "Educating the public about legal rights, responsibilities and procedures",
    image: "/images/hero/developers.jpg",
    overlayImage: "/images/hero/tech-overlay.png",
    cta: "Learn More",
    color: "from-indigo-600/20 via-transparent to-transparent",
    icon: <HiOutlineAcademicCap className="w-8 h-8" />,
    accent: "indigo"
  }
];

const stats = [
  { number: "500+", label: "Clients Served", icon: <HiOutlineUserGroup className="w-6 h-6" /> },
  { number: "50+", label: "Legal Experts", icon: <HiOutlineScale className="w-6 h-6" /> },
  { number: "95%", label: "Success Rate", icon: <HiOutlineShieldCheck className="w-6 h-6" /> },
  { number: "24/7", label: "Support Available", icon: <HiOutlineLightBulb className="w-6 h-6" /> }
];

// Particle animation component
const Particles = ({ count = 20 }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 rounded-full bg-white/10"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.25
          }}
          animate={{
            y: [null, "-20%"],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%"
          }}
        />
      ))}
    </div>
  );
};

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-blue-900/70" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].color}`} />
          </motion.div>
        </AnimatePresence>
        
        {/* SVG Wave Overlay */}
        <div className="absolute inset-0 w-full h-full opacity-30">
          <Image
            src="/hero/hero-wave.svg"
            alt="Wave Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Animated Particles */}
        <Particles count={30} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
              >
                {/* Accent Icon */}
                <motion.div 
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${slides[currentSlide].accent}-600/20 mb-6`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={`text-${slides[currentSlide].accent}-400`}>
                    {slides[currentSlide].icon}
                  </div>
                </motion.div>
                
                <h2 className="text-2xl font-medium text-blue-300 mb-3">
                  {slides[currentSlide].subtitle}
                </h2>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 text-transparent bg-clip-text">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8">
                  {slides[currentSlide].description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/services"
                    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-${slides[currentSlide].accent}-600 rounded-lg hover:bg-${slides[currentSlide].accent}-700 transition-colors`}
                  >
                    {slides[currentSlide].cta}
                    <HiOutlineChevronRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-100 border-2 border-blue-400 rounded-lg hover:bg-blue-400/10 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Slide Indicators */}
            <div className="flex space-x-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? `bg-${slides[currentSlide].accent}-500 w-10` : 'bg-white/30'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Image/Animation */}
          <div className="relative h-[400px] lg:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.8 }}
                className="relative h-full w-full"
              >
                {/* Main Image */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={slides[currentSlide].overlayImage || "/images/logo.png"}
                    alt={slides[currentSlide].title}
                    fill
                    className="object-contain"
                    priority
                  />
                  
                  {/* Decorative Elements */}
                  <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-${slides[currentSlide].accent}-500/20 blur-xl`} />
                  <div className={`absolute -top-6 -left-6 w-24 h-24 rounded-full bg-${slides[currentSlide].accent}-500/30 blur-lg`} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex justify-center mb-4 text-blue-300"
              >
                {stat.icon}
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {stat.number}
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className="text-blue-200"
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 