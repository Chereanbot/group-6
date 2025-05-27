"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HiOutlineScale, 
  HiOutlineHome, 
  HiOutlineOfficeBuilding, 
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineGlobe,
  HiOutlineAcademicCap,
  HiOutlineLightBulb,
  HiOutlineArrowRight
} from 'react-icons/hi';

const services = [
  {
    id: 'criminal-law',
    title: 'Criminal Law',
    description: 'Expert defense against criminal charges with personalized legal representation from our experienced team',
    icon: <HiOutlineShieldCheck className="w-8 h-8" />,
    color: 'blue',
    image: '/images/services/criminal-law.jpg',
    features: [
      'Case evaluation and strategy development',
      'Court representation and advocacy',
      'Evidence analysis and preparation',
      'Negotiation with prosecutors',
      'Post-conviction assistance'
    ],
    caseStudy: 'Successfully defended a client facing serious charges, resulting in case dismissal through careful evidence analysis'
  },
  {
    id: 'family-law',
    title: 'Family Law',
    description: 'Compassionate guidance through divorce, custody, and other sensitive family-related legal matters',
    icon: <HiOutlineHome className="w-8 h-8" />,
    color: 'green',
    image: '/images/services/family-law.jpg',
    features: [
      'Divorce and separation proceedings',
      'Child custody and support arrangements',
      'Property division negotiations',
      'Domestic violence protection',
      'Adoption assistance'
    ],
    caseStudy: 'Helped a family navigate a complex custody arrangement with a solution that prioritized the childrens wellbeing'
  },
  {
    id: 'civil-law',
    title: 'Civil Law',
    description: 'Effective resolution of disputes between individuals or organizations through negotiation or litigation',
    icon: <HiOutlineScale className="w-8 h-8" />,
    color: 'purple',
    image: '/images/services/civil-law.jpg',
    features: [
      'Contract disputes and enforcement',
      'Property and land disputes',
      'Personal injury claims',
      'Debt collection and recovery',
      'Alternative dispute resolution'
    ],
    caseStudy: 'Resolved a complex property boundary dispute through mediation, saving our clients time and legal expenses'
  },
  {
    id: 'corporate-law',
    title: 'Corporate Law',
    description: 'Comprehensive legal services for businesses of all sizes, from startups to established corporations',
    icon: <HiOutlineOfficeBuilding className="w-8 h-8" />,
    color: 'amber',
    image: '/images/services/corporate-law.jpg',
    features: [
      'Business formation and registration',
      'Contract drafting and review',
      'Regulatory compliance guidance',
      'Mergers and acquisitions',
      'Intellectual property protection'
    ],
    caseStudy: 'Guided a local startup through incorporation, licensing, and first-round investment negotiations'
  },
  {
    id: 'property-law',
    title: 'Property Law',
    description: 'Expert assistance with real estate transactions, landlord-tenant issues, and property rights',
    icon: <HiOutlineHome className="w-8 h-8" />,
    color: 'emerald',
    image: '/images/services/property-law.jpg',
    features: [
      'Real estate transactions and contracts',
      'Landlord-tenant dispute resolution',
      'Property rights and easements',
      'Land use and zoning issues',
      'Construction disputes'
    ],
    caseStudy: 'Successfully represented a group of tenants in securing proper housing conditions from a negligent landlord'
  },
  {
    id: 'labor-law',
    title: 'Labor Law',
    description: 'Protection of employee rights and assistance with workplace-related legal matters',
    icon: <HiOutlineUserGroup className="w-8 h-8" />,
    color: 'red',
    image: '/images/services/labor-law.jpg',
    features: [
      'Wrongful termination cases',
      'Workplace discrimination claims',
      'Wage and hour disputes',
      'Employment contract review',
      'Workplace safety violations'
    ],
    caseStudy: 'Recovered unpaid wages and compensation for a group of workers through strategic negotiation with their employer'
  },
  {
    id: 'immigration-law',
    title: 'Immigration Law',
    description: 'Guidance through complex immigration processes, visa applications, and refugee status claims',
    icon: <HiOutlineGlobe className="w-8 h-8" />,
    color: 'indigo',
    image: '/images/services/immigration-law.jpg',
    features: [
      'Visa application assistance',
      'Refugee and asylum claims',
      'Deportation defense',
      'Family reunification',
      'Citizenship applications'
    ],
    caseStudy: 'Successfully helped a refugee family navigate the asylum process and establish legal residency'
  },
  {
    id: 'education-outreach',
    title: 'Legal Education',
    description: 'Community workshops and educational programs to improve legal literacy and access to justice',
    icon: <HiOutlineAcademicCap className="w-8 h-8" />,
    color: 'pink',
    image: '/images/services/legal-education.jpg',
    features: [
      'Community legal workshops',
      'Know-your-rights training',
      'Student mentorship programs',
      'Public legal resources',
      'Professional development'
    ],
    caseStudy: 'Conducted a series of workshops that helped over 200 community members better understand their legal rights'
  }
];

const ServicesSection = () => {
  const [activeService, setActiveService] = useState<string | null>(null);
  
  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-blue-100/30 to-transparent dark:from-blue-900/10 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gradient-to-tr from-primary-100/30 to-transparent dark:from-primary-900/10 rounded-tr-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
              <HiOutlineDocumentText className="mr-1.5 h-4 w-4" />
              DULAS Services
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-blue-600 text-transparent bg-clip-text"
          >
            Our Legal Services
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Dilla University Legal Aid Service provides comprehensive legal assistance
            across a wide range of practice areas
          </motion.p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
              className={`group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700`}
              onMouseEnter={() => setActiveService(service.id)}
              onMouseLeave={() => setActiveService(null)}
            >
              {/* Service Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r from-${service.color}-500 to-${service.color}-700 opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                    {service.icon}
                  </div>
                </div>
              </div>
              
              {/* Service Content */}
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {service.description}
                </p>
                
                {/* Features List */}
                <ul className="space-y-2 mb-4">
                  {service.features.slice(0, 3).map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: activeService === service.id ? 1 : 0.7,
                        x: activeService === service.id ? 0 : -5
                      }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className={`flex-shrink-0 h-5 w-5 rounded-full bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center mr-2 mt-0.5`}>
                        <span className={`h-2 w-2 rounded-full bg-${service.color}-500`}></span>
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              {/* Footer */}
              <div className="p-6 pt-0 mt-auto">
                <Link 
                  href={`/services/${service.id}`}
                  className={`inline-flex items-center text-${service.color}-600 dark:text-${service.color}-400 font-medium text-sm`}
                >
                  Learn more
                  <motion.span
                    animate={{ x: activeService === service.id ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiOutlineArrowRight className="ml-2 h-4 w-4" />
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Case Studies Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">How We've Helped</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real success stories from our legal aid service that demonstrate our commitment to justice
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.slice(0, 3).map((service, index) => (
                <motion.div
                  key={`case-${service.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-md"
                >
                  <div className={`w-12 h-12 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center text-${service.color}-500 mb-4`}>
                    {service.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{service.title} Case</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">"{service.caseStudy}"</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                href="/case-studies"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
              >
                View All Case Studies
                <HiOutlineArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;