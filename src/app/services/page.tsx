"use client";

import { motion } from 'framer-motion';
import { 
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineClock,
  HiOutlineChevronRight,
  HiOutlineLightBulb
} from 'react-icons/hi';

interface Service {
  icon: JSX.Element;
  title: string;
  description: string;
  features: string[];
  category: string;
}

export default function ServicesPage() {
  const services: Service[] = [
    {
      icon: <HiOutlineScale className="w-8 h-8" />,
      title: "Civil Litigation",
      description: "Expert representation in civil disputes and litigation matters",
      features: [
        "Case evaluation and strategy",
        "Court representation",
        "Settlement negotiation",
        "Appeals handling"
      ],
      category: "Legal Services"
    },
    {
      icon: <HiOutlineBriefcase className="w-8 h-8" />,
      title: "Corporate Law",
      description: "Comprehensive legal solutions for businesses",
      features: [
        "Business formation",
        "Contract drafting",
        "Regulatory compliance",
        "Corporate governance"
      ],
      category: "Business Services"
    },
    {
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      title: "Family Law",
      description: "Compassionate legal support for family matters",
      features: [
        "Divorce proceedings",
        "Child custody",
        "Property division",
        "Adoption services"
      ],
      category: "Personal Services"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Our Legal Services
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
              Comprehensive legal solutions tailored to your needs
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <motion.div 
        className="py-24 bg-gray-50 dark:bg-gray-900"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden
                  transition-all duration-300 hover:shadow-2xl"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center 
                    justify-center text-white mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {service.description}
                  </p>
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <HiOutlineChevronRight className="w-5 h-5 text-primary-500" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {service.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Why Choose Us */}
      <motion.div 
        className="py-24 bg-white dark:bg-gray-800"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose Our Services
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Experience the difference of our professional legal services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <HiOutlineLightBulb className="w-6 h-6" />,
                title: "Expert Advice",
                description: "Professional guidance from experienced lawyers"
              },
              {
                icon: <HiOutlineClock className="w-6 h-6" />,
                title: "24/7 Support",
                description: "Round-the-clock assistance for urgent matters"
              },
              {
                icon: <HiOutlineShieldCheck className="w-6 h-6" />,
                title: "Confidentiality",
                description: "Your information is always protected"
              },
              {
                icon: <HiOutlineGlobe className="w-6 h-6" />,
                title: "Global Reach",
                description: "Services available across multiple jurisdictions"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto bg-primary-500 rounded-xl flex items-center 
                  justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        className="py-24 bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-transparent"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Ready to Get Started?
            </h2>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border border-transparent 
                  text-lg font-medium rounded-full shadow-lg text-white 
                  bg-primary-500 hover:bg-primary-600 transition-all duration-300
                  hover:shadow-primary-500/50"
              >
                Schedule a Consultation
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 