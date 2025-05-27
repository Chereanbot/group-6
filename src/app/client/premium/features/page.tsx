"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HiOutlineStar, 
  HiOutlineUserGroup, 
  HiOutlineClock, 
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlinePhone,
  HiOutlineChat,
  HiOutlineScale,
  HiOutlineLightBulb,
  HiOutlineGlobe,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineUser
} from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PremiumFeatures = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: 'expert-lawyers',
      title: 'Expert Legal Representation',
      description: 'Get matched with our top-performing lawyers who specialize in your specific case type. Our premium service ensures you receive representation from experienced professionals with proven track records.',
      icon: <HiOutlineUserGroup className="w-12 h-12 text-primary-500" />,
      stats: '95% success rate',
      image: '/images/services/expert-lawyers.jpg'
    },
    {
      id: 'priority-handling',
      title: 'Priority Case Handling',
      description: 'Skip the queue with expedited processing of your case. Premium clients receive immediate attention, faster document processing, and priority scheduling for all appointments and consultations.',
      icon: <HiOutlineClock className="w-12 h-12 text-primary-500" />,
      stats: '48hr response time',
      image: '/images/services/priority.jpg'
    },
    {
      id: 'direct-communication',
      title: 'Direct Lawyer Communication',
      description: 'Communicate directly with your assigned lawyer through secure channels. Get immediate responses to your questions and concerns without going through intermediaries.',
      icon: <HiOutlinePhone className="w-12 h-12 text-primary-500" />,
      stats: 'Unlimited access',
      image: '/images/services/communication.jpg'
    },
    {
      id: 'comprehensive-docs',
      title: 'Comprehensive Document Management',
      description: 'Receive full support for all your legal documentation needs. Our premium service includes document preparation, review, filing, and secure digital storage with easy access.',
      icon: <HiOutlineDocumentText className="w-12 h-12 text-primary-500" />,
      stats: 'Full document support',
      image: '/images/services/documents.jpg'
    },
    {
      id: 'extended-hours',
      title: 'Extended Support Hours',
      description: 'Access legal support beyond standard office hours. Premium clients enjoy extended consultation hours and emergency support for time-sensitive matters.',
      icon: <HiOutlineClock className="w-12 h-12 text-primary-500" />,
      stats: '24/7 emergency access',
      image: '/images/services/extended-hours.jpg'
    },
    {
      id: 'strategy-sessions',
      title: 'Strategic Case Planning',
      description: 'Benefit from dedicated strategy sessions with your legal team. Develop comprehensive case strategies tailored to your specific situation and goals.',
      icon: <HiOutlineLightBulb className="w-12 h-12 text-primary-500" />,
      stats: 'Personalized strategy',
      image: '/images/services/strategy.jpg'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Abebe Kebede',
      role: 'Business Owner',
      content: 'The premium service exceeded my expectations. My lawyer was responsive, knowledgeable, and helped me resolve my business dispute efficiently.',
      avatar: '/images/testimonials/avatar1.jpg'
    },
    {
      id: 2,
      name: 'Sara Hailu',
      role: 'Real Estate Developer',
      content: 'I was impressed by the level of expertise and attention to detail. The priority handling saved me valuable time, and the outcome was better than I expected.',
      avatar: '/images/testimonials/avatar2.jpg'
    },
    {
      id: 3,
      name: 'Dawit Mekonnen',
      role: 'Family Law Client',
      content: 'Having direct access to my lawyer made a huge difference in my case. The strategic planning sessions were invaluable, and I felt supported throughout the process.',
      avatar: '/images/testimonials/avatar3.jpg'
    }
  ];

  const stats = [
    { id: 1, label: 'Success Rate', value: '95%', icon: <HiOutlineChartBar className="w-8 h-8" /> },
    { id: 2, label: 'Expert Lawyers', value: '50+', icon: <HiOutlineUserGroup className="w-8 h-8" /> },
    { id: 3, label: 'Cases Handled', value: '1000+', icon: <HiOutlineDocumentText className="w-8 h-8" /> },
    { id: 4, label: 'Client Satisfaction', value: '98%', icon: <HiOutlineStar className="w-8 h-8" /> }
  ];

  const faqs = [
    {
      question: 'How are premium lawyers selected?',
      answer: 'Our premium lawyers are selected based on their expertise, experience, and track record of success. They undergo a rigorous vetting process and must maintain high performance standards to remain in our premium service program.'
    },
    {
      question: 'What types of cases do premium services cover?',
      answer: 'Our premium services cover a wide range of legal matters including but not limited to business law, family law, property disputes, criminal defense, intellectual property, and civil litigation.'
    },
    {
      question: 'How quickly will my case be assigned to a lawyer?',
      answer: 'Premium clients are assigned to a lawyer within 24-48 hours of completing their registration and payment. In urgent cases, we can expedite this process even further.'
    },
    {
      question: 'Can I switch lawyers if Im not satisfied?',
      answer: 'Yes, premium clients have the option to request a different lawyer if they feel their current assignment isnt the right fit. We strive to ensure you have the best possible representation for your specific case.'
    },
    {
      question: 'Are there different premium service tiers?',
      answer: 'Yes, we offer Basic, Standard, and Premium plans to accommodate different needs and budgets. Each tier offers increasing levels of service and priority.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-100 dark:bg-primary-900/20 opacity-50"
            style={{ transform: `translate(${scrollY * 0.05}px, ${scrollY * -0.05}px)` }}
          />
          <div 
            className="absolute top-60 -left-40 w-96 h-96 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-40"
            style={{ transform: `translate(${scrollY * -0.03}px, ${scrollY * 0.03}px)` }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-1 border-primary-500 text-primary-600 dark:text-primary-400 mb-6">
                DULAS Premium Services
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Exceptional Legal Services</span>
                <span className="block text-primary-600 dark:text-primary-500">For Premium Clients</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                Experience the highest level of legal representation with priority handling, dedicated experts, and comprehensive support.
              </p>
            </motion.div>
            
            <motion.div 
              className="mt-10 max-w-sm mx-auto sm:flex sm:max-w-none sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <Link href="/client/registration/payment">
                  <Button size="lg" className="w-full">
                    Get Premium Access
                    <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/client/service-selection">
                  <Button variant="outline" size="lg" className="w-full">
                    <HiOutlineArrowLeft className="mr-2 h-5 w-5" />
                    Compare Services
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('features')}
              className={`${
                activeTab === 'features'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Premium Features
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`${
                activeTab === 'testimonials'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Client Testimonials
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`${
                activeTab === 'faq'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              FAQ
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Section */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Premium Features
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our premium legal services offer exclusive benefits designed to provide you with the best possible legal experience.
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-16">
              {stats.map((stat) => (
                <div 
                  key={stat.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 mb-4">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* Feature Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        {feature.icon}
                      </div>
                      <Badge variant="outline" className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800">
                        {feature.stats}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* CTA */}
            <div className="mt-16 text-center">
              <Link href="/client/registration/payment">
                <Button size="lg" className="px-8">
                  Get Premium Access Now
                  <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
        
        {/* Testimonials Section */}
        {activeTab === 'testimonials' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Client Testimonials
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Hear from our satisfied premium clients about their experiences with our legal services.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                      <div className="h-full w-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {testimonial.avatar ? (
                          <Image 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            width={48} 
                            height={48} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <HiOutlineUser className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HiOutlineStar key={star} className="inline-block h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">"{testimonial.content}"</p>
                </motion.div>
              ))}
            </div>
            
            {/* Success Story */}
            <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 p-8 md:p-12">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 mb-6">
                    Success Story
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-4">How Our Premium Service Helped Win a Complex Business Dispute</h3>
                  <p className="text-primary-100 mb-6">
                    When Abebe's company faced a complex contract dispute that threatened his business, our premium legal team stepped in with strategic expertise and dedicated support.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <HiOutlineBadgeCheck className="h-6 w-6 text-white" />
                      </div>
                      <p className="ml-3 text-primary-100">Expedited case processing saved critical business relationships</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <HiOutlineBadgeCheck className="h-6 w-6 text-white" />
                      </div>
                      <p className="ml-3 text-primary-100">Strategic planning sessions developed a winning approach</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <HiOutlineBadgeCheck className="h-6 w-6 text-white" />
                      </div>
                      <p className="ml-3 text-primary-100">Direct communication with senior lawyers ensured clarity throughout</p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button variant="secondary" size="lg">
                      Read Full Case Study
                    </Button>
                  </div>
                </div>
                <div className="md:w-1/2 bg-gray-200 dark:bg-gray-700">
                  <div className="h-64 md:h-full w-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <HiOutlineDocumentText className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* FAQ Section */}
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Find answers to common questions about our premium legal services.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                        <span className="text-sm font-bold">Q</span>
                      </span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 ml-9">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Still have questions about our premium services?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="flex items-center justify-center">
                    <HiOutlinePhone className="mr-2 h-5 w-5" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center">
                    <HiOutlineChat className="mr-2 h-5 w-5" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Footer CTA */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Experience Premium Legal Services?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
              Join our premium clients and get the legal representation you deserve with priority handling and expert support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/client/registration/payment">
                <Button size="lg" className="px-8">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/client/service-selection">
                <Button variant="outline" size="lg">
                  Compare All Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PremiumFeatures;
