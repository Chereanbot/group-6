"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlineScale,
  HiOutlineShieldCheck,
  HiOutlineChatAlt2,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineChevronRight,
  HiOutlineLightningBolt,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineMailOpen,
  HiOutlineLocationMarker,
  HiOutlineChevronLeft
} from 'react-icons/hi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { title: 'Home', href: '/', icon: <HiOutlineHome className="w-5 h-5" /> },
    { title: 'About', href: '/about', icon: <HiOutlineInformationCircle className="w-5 h-5" /> },
    { title: 'Services', href: '/services', icon: <HiOutlineScale className="w-5 h-5" /> },
    { title: 'Documents', href: '/documents', icon: <HiOutlineDocumentText className="w-5 h-5" /> },
    { tittle: 'Programmes', href: '/programmes', icon: <HiOutlineInformationCircle className='w-5 h-5'/>},
    { title: 'Rules & Regulations', href: '/rules', icon: <HiOutlineBookOpen className="w-5 h-5" /> },
    { title: 'Feedback', href: '/feedback', icon: <HiOutlineStar className="w-5 h-5" /> },
    { title: 'Contact', href: '/contact', icon: <HiOutlinePhone className="w-5 h-5" /> }
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.img 
                src="/images/logo.png" 
                alt="Dilla University Legal Aid Service"
                className="h-12 w-auto rounded-lg shadow-lg"
                initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
              />
              <motion.span 
                className="ml-3 text-xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Du Las
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 
                dark:hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            ))}
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg
              bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400
              hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2
              focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? (
                <HiOutlineX className="block h-6 w-6" />
              ) : (
                <HiOutlineMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600
                dark:hover:text-primary-500 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            ))}
            <Link
              href="/login"
              className="flex items-center justify-center px-4 py-2 rounded-lg
              bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const features = [
  {
    icon: <HiOutlineScale className="w-6 h-6" />,
    title: 'Legal Expertise',
    description: 'Access to experienced lawyers specializing in various legal areas'
  },
  {
    icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
    title: 'Direct Communication',
    description: 'Seamless communication with your legal team through our platform'
  },
  {
    icon: <HiOutlineDocumentText className="w-6 h-6" />,
    title: 'Document Management',
    description: 'Secure storage and easy sharing of case-related documents'
  },
  {
    icon: <HiOutlineShieldCheck className="w-6 h-6" />,
    title: 'Secure & Confidential',
    description: 'Your data is protected with enterprise-grade security measures'
  }
];

const services = [
  {
    title: 'Criminal Law',
    description: 'Defense against criminal charges and legal representation',
    color: 'bg-blue-500'
  },
  {
    title: 'Family Law',
    description: 'Divorce, custody, and other family-related legal matters',
    color: 'bg-green-500'
  },
  {
    title: 'Civil Law',
    description: 'Resolution of disputes between individuals or organizations',
    color: 'bg-purple-500'
  },
  {
    title: 'Corporate Law',
    description: 'Legal services for businesses and corporations',
    color: 'bg-orange-500'
  }
];

const partners = [
  {
    name: 'CBE Birr',
    logo: '/images/partners/cbe-birr.png',
    description: 'Commercial Bank of Ethiopia Mobile Banking'
  },
  {
    name: 'Awash Bank',
    logo: '/images/partners/awash-bank.png',
    description: 'Leading Private Bank in Ethiopia'
  },
  {
    name: 'United Nations',
    logo: '/images/partners/un.png',
    description: 'International Peace & Development'
  },
  {
    name: 'Ethiopian Bar Association',
    logo: '/images/partners/eba.png',
    description: 'Professional Legal Association'
  },
  {
    name: 'Ministry of Justice',
    logo: '/images/partners/moj.png',
    description: 'Ethiopian Justice System'
  },
  {
    name: 'UNHCR',
    logo: '/images/partners/unhcr.png',
    description: 'UN Refugee Agency'
  }
];

const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const intervalId = setInterval(scroll, 30);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Our Partners</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Proud to work with leading organizations
          </p>
        </motion.div>

        <div 
          ref={scrollRef}
          className="relative overflow-hidden whitespace-nowrap"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <div className="inline-flex gap-12 py-8">
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center justify-center w-48 h-48 bg-white dark:bg-gray-800 
                  rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="relative w-32 h-32">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-full h-full object-contain filter dark:brightness-90"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center whitespace-normal">
                  {partner.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-[#1a472a] to-[#2c5282] text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -inset-[10px] opacity-50"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear" 
          }}
        >
          <div className="w-full h-full bg-[url('/images/pattern.png')] opacity-10" />
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center mb-4"
            >
              <img 
                src="/images/logo.png" 
                alt="DU Las Logo" 
                className="h-12 w-auto mr-3"
              />
              <span className="text-xl font-bold">Du Las</span>
            </motion.div>
            <p className="text-gray-300 mb-6">
              Providing accessible legal assistance to our community through dedicated service and expertise.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links */}
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Contact', 'FAQ'].map((item) => (
                <motion.li 
                  key={item}
                  whileHover={{ x: 5 }}
                  className="hover:text-gray-300 cursor-pointer"
                >
                  <Link href="#">{item}</Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <motion.li 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/10 p-2 rounded-full">
                  <HiOutlinePhone className="w-5 h-5" />
                </div>
                <span>+251 123 456 789</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/10 p-2 rounded-full">
                  <HiOutlineMailOpen className="w-5 h-5" />
                </div>
                <span>info@dulas.edu.et</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/10 p-2 rounded-full">
                  <HiOutlineLocationMarker className="w-5 h-5" />
                </div>
                <span>Dilla University, Ethiopia</span>
              </motion.li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="mt-12 pt-8 border-t border-white/10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} Dilla University Legal Aid Service. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

const ParallaxSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              image: "/images/dilla-logo.png",
              title: "Dilla University",
              description: "A premier institution of higher learning established in 2007, committed to excellence in education and research.",
              delay: 0
            },
            {
              image: "/images/legal-aid-logo.png",
              title: "Legal Aid Services",
              description: "Providing free legal assistance to the community through professional expertise and dedicated service.",
              delay: 0.2
            },
            {
              image: "/images/faculty.jpg",
              title: "Law Faculty",
              description: "Expert legal professionals and academics working together to deliver quality legal education and services.",
              delay: 0.4
            },
            {
              image: "/images/community.jpg",
              title: "Community Impact",
              description: "Making a difference in our community through accessible legal support and advocacy.",
              delay: 0.6
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: item.delay,
                type: "spring"
              }}
              className="relative group"
            >
              <div className="relative h-[300px] overflow-hidden rounded-xl">
                <motion.div
                  initial={{ y: 0 }}
                  whileInView={{ y: -20 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                    style={{ 
                      objectFit: "cover"
                    }}
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-200 text-sm">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface Slide {
  type: 'video' | 'image';
  image: string;
  video?: string;
  title: string;
  description: string;
  overlay: string;
  badges: string[];
  cta: {
    primary: { text: string; href: string; };
    secondary: { text: string; href: string; };
  };
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const slides: Slide[] = [
    {
      type: 'video',
      image: "/hero/hero1.jpg",
      video: "/hero/legal-services.mp4",
      title: "Professional Legal Services",
      description: "Expert legal assistance for our community with dedicated support and guidance",
      overlay: "from-black/80 via-black/50 to-transparent",
      badges: ["24/7 Support", "Expert Team", "Trusted Service"],
      cta: {
        primary: { text: "Get Started", href: "/services" },
        secondary: { text: "Learn More", href: "/about" }
      }
    },
    {
      type: 'image',
      image: "/hero/hero2.jpg",
      title: "Student Legal Support",
      description: "Comprehensive legal services tailored for university students and academic needs",
      overlay: "from-primary-900/80 via-primary-900/50 to-transparent",
      badges: ["Student Focus", "Academic Support", "Affordable"],
      cta: {
        primary: { text: "Student Services", href: "/student-services" },
        secondary: { text: "Contact Us", href: "/contact" }
      }
    },
    {
      type: 'image',
      image: "/hero/hero3.jpg",
      title: "Community Outreach",
      description: "Making legal aid accessible to all members of our diverse community",
      overlay: "from-gray-900/80 via-gray-900/50 to-transparent",
      badges: ["Community First", "Inclusive Support", "Free Consultation"],
      cta: {
        primary: { text: "Join Program", href: "/community" },
        secondary: { text: "Learn More", href: "/programs" }
      }
    },
    {
      type: 'image',
      image: "/hero/hero4.jpg",
      title: "Expert Consultation",
      description: "Professional guidance from experienced legal practitioners when you need it most",
      overlay: "from-primary-800/80 via-primary-800/50 to-transparent",
      badges: ["Expert Advice", "Confidential", "Personalized"],
      cta: {
        primary: { text: "Book Consultation", href: "/consultation" },
        secondary: { text: "Our Experts", href: "/team" }
      }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isVideoPlaying) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [isVideoPlaying, slides.length]);

  // Particle effect component
  const ParticleEffect = () => (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent" />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: "100%",
            opacity: 0.2 + Math.random() * 0.3,
            scale: 0.2 + Math.random() * 0.8,
          }}
          animate={{
            y: "0%",
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-gray-900">
      <ParticleEffect />
      
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: currentSlide === index ? 1 : 0,
            scale: currentSlide === index ? 1 : 1.1
          }}
          transition={{ 
            duration: 1.2,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            {slide.type === 'video' && slide.video ? (
              <video
                ref={videoRef}
                poster={slide.image}
                className="w-full h-full object-cover object-center"
                playsInline
                muted
                loop
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src={slide.video} type="video/mp4" />
              </video>
            ) : (
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
            )}
            
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
            
            <div className="absolute inset-0 flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: currentSlide === index ? 1 : 0,
                  y: currentSlide === index ? 0 : 30
                }}
                transition={{ 
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeOut"
                }}
                className="container mx-auto px-4 sm:px-6 lg:px-8"
              >
                <div className="max-w-xl">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {slide.badges.map((badge, i) => (
                      <motion.span
                        key={badge}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="px-3 py-1 text-sm bg-white/10 backdrop-blur-sm 
                          rounded-full text-white font-medium"
                      >
                        {badge}
                      </motion.span>
                    ))}
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 
                    leading-tight text-white"
                  >
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-100 mb-8 
                    leading-relaxed"
                  >
                    {slide.description}
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: currentSlide === index ? 1 : 0,
                      y: currentSlide === index ? 0 : 20
                    }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      href={slide.cta.primary.href}
                      className="px-8 py-4 bg-primary-600 hover:bg-primary-700 
                        text-white rounded-lg font-medium transition-all duration-300 
                        transform hover:scale-105 hover:shadow-lg"
                    >
                      {slide.cta.primary.text}
                    </Link>
                    <Link
                      href={slide.cta.secondary.href}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white 
                        backdrop-blur-sm rounded-lg font-medium transition-all duration-300
                        transform hover:scale-105 border border-white/20"
                    >
                      {slide.cta.secondary.text}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
        flex space-x-3 z-20"
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-500 
              ${currentSlide === index 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/80"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-4 
          rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm
          transition-all duration-300 hover:scale-110 z-20 group"
        aria-label="Previous slide"
      >
        <HiOutlineChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 
          rounded-full bg-black/20 hover:bg-black/30 text-white backdrop-blur-sm
          transition-all duration-300 hover:scale-110 z-20 group"
        aria-label="Next slide"
      >
        <HiOutlineChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-8 z-20"
      >
        <div className="flex flex-col items-center">
          <div className="text-white/60 text-sm mb-2">Scroll</div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="w-5 h-8 border-2 border-white/30 rounded-full 
              flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Dr. Abebe Kebede",
      role: "Law Professor",
      image: "/images/testimonials/testimonial1.jpg",
      video: "/videos/testimonial1.mp4",
      quote: "The legal aid service has transformed how we provide legal assistance to our community."
    },
    {
      id: 2,
      name: "Sara Mohammed",
      role: "Community Leader",
      image: "/images/testimonials/testimonial2.jpg",
      video: "/videos/testimonial2.mp4",
      quote: "Their dedication to providing accessible legal services is remarkable."
    },
    // Add more testimonials...
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">What People Say</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hear from our community members and partners
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
            >
              <div className="relative aspect-video">
                <video
                  poster={testimonial.image}
                  className="w-full h-full object-cover"
                  controls
                >
                  <source src={testimonial.video} type="video/mp4" />
                </video>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { label: 'Cases Handled', value: 5000, suffix: '+' },
    { label: 'Success Rate', value: 98, suffix: '%' },
    { label: 'Community Members', value: 10000, suffix: '+' },
    { label: 'Legal Experts', value: 50, suffix: '+' }
  ];

  return (
    <section className="py-20 bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat key={stat.label} {...stat} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const AnimatedStat = ({ label, value, suffix, delay }: { 
  label: string; 
  value: number; 
  suffix: string;
  delay: number;
}) => {
  const [count, setCount] = useState(0);
  const duration = 2000; // Animation duration in milliseconds
  const steps = 60; // Number of steps in the animation

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    // Delay the start of the animation
    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="text-4xl lg:text-5xl font-bold mb-2">
        {count}{suffix}
      </div>
      <p className="text-primary-100">{label}</p>
    </motion.div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "What types of legal services do you provide?",
      answer: "We offer a comprehensive range of legal services including civil law, criminal law, family law, and more. Our team of experienced legal professionals is here to help with various legal matters."
    },
    {
      question: "How can I schedule a consultation?",
      answer: "You can schedule a consultation by filling out our online form, calling our office, or visiting us in person during business hours. We strive to respond to all inquiries within 24 hours."
    },
    // Add more FAQs...
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions about our legal services
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <span className="font-medium">{faq.question}</span>
                <motion.span
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </motion.span>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: activeIndex === index ? "auto" : 0,
                  opacity: activeIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsSection = () => {
  const news = [
    {
      title: "New Legal Aid Program Launched",
      date: "2024-03-15",
      image: "/images/news/news1.jpg",
      excerpt: "Expanding our services to reach more community members in need of legal assistance."
    },
    // Add more news items...
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Latest Updates</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay informed about our latest news and developments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <time className="text-sm text-gray-500 mb-2 block">
                  {new Date(item.date).toLocaleDateString()}
                </time>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {item.excerpt}
                </p>
                <Link
                  href="#"
                  className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                >
                  Read More
                  <HiOutlineChevronRight className="ml-1 w-5 h-5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            Why Choose Us
          </motion.h2>
          <p className="text-gray-600 dark:text-gray-400">
            Experience the future of legal services with our comprehensive platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm
                hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30
                rounded-lg flex items-center justify-center text-primary-500 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-4"
          >
            Our Services
          </motion.h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive legal solutions for all your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className={`absolute inset-0 ${service.color} opacity-10
                group-hover:opacity-20 transition-opacity`} />
              <div className="relative p-8">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                <Link href="/services" className="inline-flex items-center text-primary-500
                  hover:text-primary-600 font-medium">
                  Learn More
                  <HiOutlineChevronRight className="ml-1 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="bg-primary-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-primary-100">
              Join thousands of satisfied clients who trust our legal services
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/register" className="inline-flex items-center justify-center
              px-6 py-3 rounded-lg bg-white text-primary-600 font-medium
              hover:bg-primary-50 transition-colors">
              Sign Up Now
              <HiOutlineLightningBolt className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center
              px-6 py-3 rounded-lg bg-primary-800 text-white font-medium
              hover:bg-primary-700 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <HeroSection />
        <ParallaxSection />
        <FeaturesSection />
        <ServicesSection />
        <TestimonialsSection />
        <StatsSection />
        <FAQSection />
        <NewsSection />
        <CTASection />
        <PartnersSection />
        <Footer />
      </div>
    </div>
  );
}
