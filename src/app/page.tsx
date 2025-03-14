"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  HiScale as HiOutlineScale,
  HiShieldCheck as HiOutlineShieldCheck,
  HiChatAlt2 as HiOutlineChatAlt2,
  HiDocumentText as HiOutlineDocumentText,
  HiUserGroup as HiOutlineUserGroup,
  HiLightningBolt as HiOutlineLightningBolt,
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineX,
  HiOutlineMenu,
  HiMail as HiOutlineMailOpen,
  HiLocationMarker as HiOutlineLocationMarker,
  HiChevronLeft as HiOutlineChevronLeft,
  HiChevronRight as HiOutlineChevronRight
} from 'react-icons/hi';

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
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Our Partners</h2>
          <p className="text-indigo-600 dark:text-indigo-400">
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
            <p className="text-blue-200 mb-6">
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
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-200 to-indigo-200 text-transparent bg-clip-text">Quick Links</h3>
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
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-200 to-indigo-200 text-transparent bg-clip-text">Contact Us</h3>
            <ul className="space-y-3">
              <motion.li 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/10 p-2 rounded-full">
                  <HiOutlinePhone className="w-5 h-5" />
                </div>
                <span>+251 947006369</span>
              </motion.li>
              <motion.li 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/10 p-2 rounded-full">
                  <HiOutlineMailOpen className="w-5 h-5" />
                </div>
                <span>cherinetafewerk@gmail.com</span>
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
            &copy; {new Date().getFullYear()} Dilla University Legal Aid Service. All rights reserved.
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
                  <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    {item.title}
                  </h3>
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

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const slideInterval = useRef<NodeJS.Timeout>();

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
      title: "Professional Legal Team",
      subtitle: "Experienced Attorneys",
      description: "Our team of dedicated lawyers is here to protect your rights and interests",
      image: "/images/hero/team.jpg",
      overlayImage: "/images/hero/team-overlay.png",
      cta: "Meet Our Team",
      color: "from-green-600/20 via-transparent to-transparent",
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      accent: "green"
    },
    {
      title: "Free Legal Consultation",
      subtitle: "We're Here to Help",
      description: "Get expert legal advice without any cost or obligation",
      image: "/images/hero/consultation.jpg",
      overlayImage: "/images/hero/consultation-overlay.png",
      cta: "Book Consultation",
      color: "from-purple-600/20 via-transparent to-transparent",
      icon: <HiOutlineChatAlt2 className="w-8 h-8" />,
      accent: "purple"
    },
    {
      title: "About Dilla University",
      subtitle: "Excellence in Education",
      description: "A premier institution committed to academic excellence and community service since 2007",
      image: "/images/hero/university.jpg",
      overlayImage: "/images/hero/university-overlay.png",
      cta: "Discover More",
      color: "from-yellow-600/20 via-transparent to-transparent",
      icon: <HiOutlineBookOpen className="w-8 h-8" />,
      accent: "yellow"
    },
    {
      title: "Meet Our Developers",
      subtitle: "Innovation & Technology",
      description: "Powered by a talented team of developers committed to creating cutting-edge legal tech solutions",
      image: "/images/hero/developers.jpg",
      overlayImage: "/images/hero/tech-overlay.png",
      cta: "Our Team",
      color: "from-red-600/20 via-transparent to-transparent",
      icon: <HiOutlineLightningBolt className="w-8 h-8" />,
      accent: "red"
    }
  ];

  useEffect(() => {
    slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    setMousePosition({ x, y });
  };

  // Enhanced Particle effect with more variety and stable values
  const ParticleEffect = () => {
    const [particles, setParticles] = useState([]);
    
    useEffect(() => {
      // Generate particles only on client-side
      const newParticles = Array.from({ length: 80 }).map((_, i) => {
        const type = i % 4; // 0: square, 1: triangle, 2: diamond, 3: circle
        const size = 1 + (i % 3); // Stable sizes: 1, 2, 3
        const xPos = (i / 80) * 100; // Distribute evenly across width
        const opacity = 0.2 + ((i % 4) / 4) * 0.3; // Stable opacity values
        const scale = 0.2 + ((i % 5) / 5) * 0.8; // Stable scale values
        const rotation = (i * 45) % 360; // Stable rotation values

        return { type, size, xPos, opacity, scale, rotation };
      });
      
      setParticles(newParticles);
    }, []); // Run only once on mount

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => {
          const baseClass = `absolute ${
            particle.type === 0
              ? `w-${particle.size} h-${particle.size}`
              : particle.type === 1
              ? `w-0 h-0 border-l-[${particle.size}px] border-l-transparent border-r-[${particle.size}px] border-r-transparent border-b-[${particle.size * 1.5}px]`
              : particle.type === 2
              ? `w-${particle.size} h-${particle.size} rotate-45`
              : `w-${particle.size} h-${particle.size} rounded-full`
          } ${
            particle.type === 0
              ? `bg-${slides[currentSlide].accent}-400`
              : particle.type === 1
              ? `border-b-${slides[currentSlide].accent}-300`
              : `bg-white`
          }`;

          return (
        <motion.div
          key={i}
              className={baseClass}
          initial={{
                x: `${particle.xPos}%`,
            y: "100%",
                opacity: particle.opacity,
                scale: particle.scale,
                rotate: particle.rotation
          }}
          animate={{
            y: "0%",
                opacity: [particle.opacity, particle.opacity * 2, 0],
                rotate: particle.rotation + 360,
                scale: [1, 1.2, 0.8, 1]
          }}
          transition={{
                duration: 2 + (i % 3),
            repeat: Infinity,
                delay: (i % 20) * 0.1,
                ease: "easeInOut"
          }}
        />
          );
        })}
    </div>
  );
  };

  // Enhanced Floating elements with dynamic effects
  const FloatingElements = () => (
    <div className="absolute inset-0 pointer-events-none">
      {slides.map((slide, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 20}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.2 }}
          >
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${slide.accent}-500/20 to-transparent 
                backdrop-blur-sm flex items-center justify-center text-white/80 group-hover:from-${slide.accent}-500/40`}
              whileHover={{
                boxShadow: `0 0 20px ${slide.accent}`,
              }}
            >
              {slide.icon}
            </motion.div>
            <motion.div
              className="absolute -inset-2 rounded-xl"
              animate={{
                boxShadow: [
                  `0 0 0 0 rgba(${slide.accent},0)`,
                  `0 0 20px 10px rgba(${slide.accent},0.2)`,
                  `0 0 0 0 rgba(${slide.accent},0)`
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
            ease: "easeInOut"
          }}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );

  // Add 3D Text Effect
  const Text3DEffect = ({ children, delay = 0 }) => (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: 20, rotateX: 90 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 100
      }}
    >
      {children}
    </motion.span>
  );

  // Enhanced slide variants with more complex animations
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45,
      filter: "blur(10px)"
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? -45 : 45,
      filter: "blur(10px)"
    })
  };

  return (
    <section 
      className="relative h-screen w-full overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%"],
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 20,
          ease: "linear"
        }}
        style={{
          backgroundImage: "url('/images/pattern.svg')",
          backgroundSize: "30px 30px"
        }}
      />

      {/* Enhanced effects */}
      <ParticleEffect />
      <FloatingElements />

      {/* Dynamic light effect */}
              <motion.div
        className="absolute inset-0 pointer-events-none"
                animate={{ 
          background: [
            `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, 
              ${slides[currentSlide].accent}-500/20 0%, transparent 50%)`,
            `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, 
              transparent 0%, transparent 50%)`
          ]
        }}
        transition={{ duration: 1 }}
      />

      {/* Hero Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <AnimatePresence initial={false} custom={currentSlide} mode="wait">
          <motion.div
            key={currentSlide}
            custom={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
                transition={{ 
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
              rotateY: { duration: 0.8 },
              scale: { duration: 0.8 },
              filter: { duration: 0.5 }
            }}
            className="absolute inset-0 flex items-center justify-between perspective-1000"
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
            }}
          >
            <div className="w-full lg:w-1/2 text-white p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 text-sm font-semibold text-blue-400 dark:text-blue-300 uppercase tracking-wider"
              >
                {slides[currentSlide].icon}
                <motion.span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
                  {slides[currentSlide].subtitle}
                      </motion.span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent 
                  bg-gradient-to-r from-white via-blue-100 to-blue-300"
              >
                {slides[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-xl text-blue-100 max-w-xl"
              >
                {slides[currentSlide].description}
              </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex gap-4"
                  >
                    <Link
                  href="/contact"
                  className="group relative inline-flex items-center px-8 py-4 text-base font-medium rounded-lg overflow-hidden"
                >
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative flex items-center text-white group-hover:text-blue-100">
                    {slides[currentSlide].cta}
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="ml-2"
                    >
                      →
                    </motion.span>
                  </span>
                    </Link>
                    <Link
                  href="/about"
                  className="group relative inline-flex items-center px-8 py-4 text-base font-medium rounded-lg overflow-hidden"
                >
                  <motion.span 
                    className="absolute inset-0 border-2 border-blue-400/20 rounded-lg"
                    whileHover={{
                      borderColor: "rgba(96, 165, 250, 0.4)",
                      boxShadow: "0 0 20px rgba(96, 165, 250, 0.2)"
                    }}
                  />
                  <span className="relative text-blue-300 group-hover:text-blue-200">Learn More</span>
                    </Link>
                  </motion.div>
                </div>

            {/* Enhanced image section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block w-1/2 h-full relative perspective-1000"
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x * -10}deg) rotateX(${mousePosition.y * -10}deg)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative w-full h-[80%] rounded-2xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
              </motion.div>
          </div>
        </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced slide navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {slides.map((_, index) => (
            <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
              className={`relative h-3 rounded-full overflow-hidden backdrop-blur-sm
                ${currentSlide === index ? "w-16" : "w-3"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
      <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400"
                initial={false}
                animate={{
                  opacity: currentSlide === index ? 1 : 0.3
                }}
              />
              {currentSlide === index && (
          <motion.div
                  className="absolute inset-0 bg-white"
                  layoutId="slideIndicator"
                  initial={false}
                  animate={{
                    x: ["0%", "235%", "0%"],
                    transition: {
                      duration: 2,
              repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
    </div>

      {/* Add overlay images for depth */}
      <motion.img
        src={slides[currentSlide].overlayImage}
        alt=""
        className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20 mix-blend-overlay"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1 }}
      />
    </section>
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
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">What People Say</h2>
          <p className="text-indigo-600 dark:text-indigo-400">
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
      <div className="text-4xl lg:text-5xl font-bold mb-2 text-white">
        {count}{suffix}
      </div>
      <p className="text-blue-200">{label}</p>
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
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Frequently Asked Questions</h2>
          <p className="text-indigo-600 dark:text-indigo-400">
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
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Latest Updates</h2>
          <p className="text-indigo-600 dark:text-indigo-400">
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
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  {item.title}
                </h3>
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
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
          >
            Why Choose Us
          </motion.h2>
          <p className="text-indigo-600 dark:text-indigo-400">
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-500 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
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
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
          >
            Our Services
          </motion.h2>
          <p className="text-indigo-600 dark:text-indigo-400">
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
              className={`group relative overflow-hidden rounded-2xl p-8 ${service.color} bg-opacity-10`}
            >
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 text-transparent bg-clip-text">Ready to Get Started?</h2>
            <p className="text-blue-200">
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
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="relative">
        <Navbar />
      </div>
      <div className="pt-32">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <TestimonialsSection />
        <PartnersSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
