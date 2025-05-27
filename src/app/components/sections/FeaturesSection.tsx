"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  HiScale as HiOutlineScale,
  HiShieldCheck as HiOutlineShieldCheck,
  HiChatAlt2 as HiOutlineChatAlt2,
  HiDocumentText as HiOutlineDocumentText,
  HiUserGroup as HiOutlineUserGroup,
  HiLightningBolt as HiOutlineLightningBolt,
  HiAcademicCap as HiOutlineAcademicCap,
  HiClock as HiOutlineClock,
  HiGlobe as HiOutlineGlobe,
  HiHeart as HiOutlineHeart,
} from 'react-icons/hi';

const features = [
  {
    icon: <HiOutlineScale className="w-8 h-8" />,
    title: 'Legal Expertise',
    description: 'Access to experienced lawyers and law students from Dilla University specializing in various legal areas',
    color: 'blue',
    image: '/images/features/legal-expertise.jpg',
    stats: '50+ Legal Experts'
  },
  {
    icon: <HiOutlineAcademicCap className="w-8 h-8" />,
    title: 'Academic Excellence',
    description: 'Backed by Dilla University Law School faculty with years of teaching and practical experience',
    color: 'green',
    image: '/images/features/academic-excellence.jpg',
    stats: '15+ Years Experience'
  },
  {
    icon: <HiOutlineChatAlt2 className="w-8 h-8" />,
    title: 'Direct Communication',
    description: 'Seamless communication with your legal team through our platform with quick response times',
    color: 'purple',
    image: '/images/features/communication.jpg',
    stats: '24/7 Support'
  },
  {
    icon: <HiOutlineDocumentText className="w-8 h-8" />,
    title: 'Document Management',
    description: 'Secure storage and easy sharing of case-related documents with your assigned legal team',
    color: 'amber',
    image: '/images/features/document.jpg',
    stats: 'Unlimited Storage'
  },
  {
    icon: <HiOutlineShieldCheck className="w-8 h-8" />,
    title: 'Secure & Confidential',
    description: 'Your data is protected with enterprise-grade security measures and strict confidentiality protocols',
    color: 'red',
    image: '/images/features/security.jpg',
    stats: 'Bank-Level Security'
  },
  {
    icon: <HiOutlineClock className="w-8 h-8" />,
    title: 'Quick Response',
    description: 'Fast case processing and prioritized handling for urgent legal matters through our efficient system',
    color: 'indigo',
    image: '/images/features/quick-response.jpg',
    stats: 'Same-Day Response'
  },
  {
    icon: <HiOutlineGlobe className="w-8 h-8" />,
    title: 'Community Impact',
    description: 'Supporting the local community through free legal aid and educational programs on legal rights',
    color: 'emerald',
    image: '/images/features/community.jpg',
    stats: '1000+ Community Members Served'
  },
  {
    icon: <HiOutlineHeart className="w-8 h-8" />,
    title: 'Compassionate Service',
    description: 'Client-centered approach focusing on understanding your unique situation and providing personalized support',
    color: 'pink',
    image: '/images/features/compassion.jpg',
    stats: '98% Client Satisfaction'
  }
];

const FeaturesSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary-500/10 to-transparent" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-100/30 dark:bg-primary-900/10 blur-3xl" />
      <div className="absolute top-1/3 -left-24 w-64 h-64 rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-2xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
              <HiOutlineScale className="mr-1.5 h-4 w-4" />
              DULAS Features
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-blue-600 text-transparent bg-clip-text"
          >
            Why Choose DULAS
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Dilla University Legal Aid Service combines academic excellence with practical legal expertise 
            to provide comprehensive support for all your legal needs
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onHoverStart={() => setHoveredFeature(feature.title)}
              onHoverEnd={() => setHoveredFeature(null)}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-b-4 border-${feature.color}-500 group`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400">
                <span>{feature.stats}</span>
                <motion.svg 
                  className="ml-2 h-4 w-4" 
                  initial={{ x: 0 }}
                  animate={{ x: hoveredFeature === feature.title ? 5 : 0 }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 bg-gradient-to-r from-primary-600 to-blue-700 rounded-3xl p-8 md:p-12 shadow-xl text-white"
        >
          
         
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;