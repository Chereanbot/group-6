"use client";

import { motion } from 'framer-motion';
import { 
  HiOutlineScale,
  HiOutlineUserGroup,
  HiOutlineGlobe,
  HiOutlineLightBulb,
  HiOutlineHeart,
  HiOutlineChevronDown,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlinePhone
} from 'react-icons/hi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { lawyers, LawyerProfile } from '@/data/lawyers';
import { useState } from 'react';

// Add new interfaces
interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

interface Award {
  title: string;
  organization: string;
  year: string;
  image: string;
  description: string;
}

export default function AboutPage() {
  const features = [
    {
      icon: <HiOutlineScale className="w-8 h-8" />,
      title: 'Legal Expertise',
      description: 'Access to experienced lawyers specializing in various legal domains'
    },
    {
      icon: <HiOutlineUserGroup className="w-8 h-8" />,
      title: 'Client-Focused',
      description: 'Personalized attention and dedicated support throughout your legal journey'
    },
    {
      icon: <HiOutlineGlobe className="w-8 h-8" />,
      title: 'Accessibility',
      description: 'Easy access to legal services through our digital platform'
    }
  ];

  const values = [
    {
      icon: <HiOutlineLightBulb className="w-6 h-6" />,
      title: 'Innovation',
      description: 'Leveraging technology to improve legal services'
    },
    {
      icon: <HiOutlineHeart className="w-6 h-6" />,
      title: 'Integrity',
      description: 'Maintaining highest ethical standards in all our dealings'
    }
  ];

  const statistics = [
    { number: '1000+', label: 'Cases Handled' },
    { number: '50+', label: 'Expert Lawyers' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' }
  ];

  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Senior Lawyer',
      image: '/team/member1.jpg',
      specialization: 'Criminal Law'
    },
    {
      name: 'Jane Smith',
      role: 'Case Manager',
      image: '/team/member2.jpg',
      specialization: 'Family Law'
    },
    // Add more team members
  ];

  const testimonials = [
    {
      quote: "The best legal service I've ever experienced",
      author: "Michael Brown",
      role: "Business Owner",
      image: "/testimonials/1.jpg"
    },
    // Add more testimonials
  ];

  const faqs: FAQ[] = [
    {
      question: "How does the legal consultation process work?",
      answer: "Our consultation process begins with an initial meeting where we discuss your case details and legal needs. We then evaluate the best course of action and provide you with a clear strategy.",
      category: "Services"
    },
    {
      question: "What areas of law do you specialize in?",
      answer: "We specialize in various areas including criminal law, civil litigation, family law, corporate law, and intellectual property law.",
      category: "Expertise"
    },
    // Add more FAQs
  ];

  const timeline: TimelineEvent[] = [
    {
      year: "2020",
      title: "Company Founded",
      description: "DulaCMS was established with a vision to revolutionize legal case management.",
      icon: <HiOutlineSparkles className="w-6 h-6" />
    },
    {
      year: "2021",
      title: "Digital Transformation",
      description: "Launched our innovative digital platform for seamless case management.",
      icon: <HiOutlineGlobeAlt className="w-6 h-6" />
    },
    // Add more timeline events
  ];

  const awards: Award[] = [
    {
      title: "Legal Innovation Award",
      organization: "Legal Tech Association",
      year: "2023",
      image: "/awards/innovation.png",
      description: "Recognized for revolutionary case management solutions"
    },
    // Add more awards
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

  const HeroSection = () => (
    <motion.div 
      className="relative min-h-[80vh] bg-gradient-to-br from-[#1a472a] to-[#2c5282] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute inset-0 opacity-20"
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div 
          className="text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.img
            src="/images/logo.png"
            alt="DU Las Logo"
            className="w-32 h-32 mx-auto mb-8 rounded-xl shadow-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
          />
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            About <span className="text-yellow-400">Du Las</span>
          </h1>
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-xl text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Empowering Justice Through Innovation
          </motion.p>
          
          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
              <HiOutlineChevronDown className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );

  const FeatureCard = ({ feature, index }: { feature: any; index: number }) => (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -10 }}
      className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
        rounded-2xl shadow-xl p-8 text-center overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-blue-500" />
      
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: index * 0.1 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#1a472a] to-[#2c5282] 
            rounded-2xl flex items-center justify-center shadow-lg text-white transform -rotate-6"
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );

  const StatCard = ({ stat, index }: { stat: any; index: number }) => (
    <motion.div
      variants={fadeInUp}
      className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg 
        overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br 
        from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: index * 0.1 }}
        className="relative z-10"
      >
        <div className="text-5xl font-bold text-primary-500 mb-2">
          {stat.number}
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {stat.label}
        </p>
      </motion.div>
    </motion.div>
  );

  const TeamCard = ({ lawyer }: { lawyer: LawyerProfile }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
      <motion.div
        variants={fadeInUp}
        whileHover={{ y: -10 }}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg 
          group hover:shadow-2xl transition-all duration-300"
      >
        {/* Profile Header */}
        <div className="relative overflow-hidden">
          <img
            src={lawyer.image}
            alt={lawyer.name}
            className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-1">{lawyer.name}</h3>
            <p className="text-gray-200 text-lg">{lawyer.role}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lawyer.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm rounded-full bg-primary-500/30 text-white"
                >
                  {spec.area}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{lawyer.ratings.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{lawyer.ratings.totalCases}+</div>
            <div className="text-sm text-gray-600">Cases Handled</div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="p-6 space-y-4">
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 
              rounded-lg hover:bg-primary-100 transition-colors"
          >
            {showDetails ? 'Show Less' : 'View Details'}
          </motion.button>

          <motion.div
            initial={false}
            animate={{ height: showDetails ? 'auto' : 0, opacity: showDetails ? 1 : 0 }}
            className="overflow-hidden"
          >
            {/* Rates */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Consultation Rates</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Consultation: {lawyer.rates.consultationFee} ETB</p>
                <p>Hourly Rate: {lawyer.rates.hourlyRate} ETB</p>
                {lawyer.rates.retainerFee && (
                  <p>Retainer Fee: {lawyer.rates.retainerFee} ETB</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Experience</h4>
              <div className="space-y-2">
                {lawyer.experience.map((exp, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{exp.position}</p>
                    <p className="text-gray-600">{exp.organization}</p>
                    <p className="text-gray-500 text-xs">{exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Availability</h4>
              <p className="text-sm text-gray-600">
                {lawyer.availability.days.join(', ')}<br />
                {lawyer.availability.hours}
              </p>
            </div>
          </motion.div>

          {/* Contact Actions */}
          <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <motion.a
              href={`mailto:${lawyer.contactInfo.email}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-primary-50 text-primary-600
                hover:bg-primary-100 transition-colors"
            >
              <HiOutlineMail className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={`tel:${lawyer.contactInfo.phone}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-primary-50 text-primary-600
                hover:bg-primary-100 transition-colors"
            >
              <HiOutlinePhone className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </motion.div>
    );
  };

  const TeamSection = () => (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">
            Our Legal Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            Meet Our Expert Lawyers
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Our team of experienced lawyers is dedicated to providing the highest quality legal services
            to our community.
          </p>
        </motion.div>

        {/* Lawyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {lawyers.map((lawyer, index) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TeamCard lawyer={lawyer} />
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {lawyers.reduce((acc, lawyer) => acc + lawyer.ratings.totalCases, 0)}+
            </div>
            <div className="text-gray-600 dark:text-gray-400">Cases Handled</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {Math.round(lawyers.reduce((acc, lawyer) => acc + lawyer.ratings.successRate, 0) / lawyers.length)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {lawyers.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Expert Lawyers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {lawyers.reduce((acc, lawyer) => acc + lawyer.ratings.clientReviews, 0)}+
            </div>
            <div className="text-gray-600 dark:text-gray-400">Client Reviews</div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Need Legal Assistance?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 
                  text-white font-medium hover:bg-primary-700 transition-colors shadow-lg"
              >
                <HiOutlinePhone className="w-5 h-5 mr-2" />
                Schedule a Consultation
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 rounded-lg border-2 
                  border-primary-600 text-primary-600 font-medium 
                  hover:bg-primary-50 transition-colors"
              >
                Learn More About Our Services
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Testimonial Preview */}
        <motion.div
          className="mt-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-primary-200 opacity-50" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="text-xl md:text-2xl font-medium mb-6">
              "Our team of dedicated lawyers is committed to providing accessible legal services
              to our community while maintaining the highest standards of professional excellence."
            </p>
            <div className="font-semibold">Dr. Abebe Kebede</div>
            <div className="text-primary-200">Senior Legal Advisor</div>
          </div>
        </motion.div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
        <HeroSection />
        
        {/* Features Grid */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-20"
              variants={fadeInUp}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What Sets Us Apart
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Our commitment to excellence and innovation in legal services
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Grid */}
        <section className="py-24 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {statistics.map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <TeamSection />

        <Footer />
      </div>
    </div>
  );
} 