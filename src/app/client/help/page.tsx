"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineDocumentText,
  HiOutlineChat,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineVideoCamera,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
  HiOutlineChevronDown,
  HiOutlineExternalLink
} from 'react-icons/hi';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          marginBottom: isOpen ? 16 : 0
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="text-gray-600 dark:text-gray-400">{answer}</p>
      </motion.div>
    </div>
  );
};

interface HelpCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const HelpCard = ({ title, description, icon, link }: HelpCardProps) => (
  <motion.a
    href={link}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md 
               transition-all duration-200 border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          {title}
          <HiOutlineExternalLink className="ml-2 w-4 h-4 text-gray-400" />
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </motion.a>
);

const HelpPage = () => {
  const faqs = [
    {
      question: "How do I schedule an appointment with my lawyer?",
      answer: "You can schedule an appointment through the dashboard by clicking on the 'Book Appointment' quick action, or by navigating to the Appointments section. Select your preferred date and time, and your lawyer will confirm the appointment."
    },
    {
      question: "Where can I find my case documents?",
      answer: "All your case documents are available in the Documents section. You can view, download, and upload new documents there. Documents are organized by case and date for easy access."
    },
    {
      question: "How do I update my contact information?",
      answer: "You can update your contact information in the Settings page under your profile. Click on your profile picture in the top right corner, select 'Settings', and update your information in the Profile section."
    },
    {
      question: "What should I do if I need immediate assistance?",
      answer: "For immediate assistance, you can use the 'Message Lawyer' feature in the dashboard, or call our 24/7 support line at 1-800-LEGAL-HELP. For emergencies, please call your local emergency services."
    },
    {
      question: "How do I make a payment?",
      answer: "Payments can be made through the Payments section or by clicking the 'Make Payment' quick action on your dashboard. We accept all major credit cards and electronic bank transfers."
    }
  ];

  const resources = [
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides on using our platform",
      icon: <HiOutlineVideoCamera className="w-6 h-6 text-blue-600" />,
      link: "/client/tutorials"
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive documentation",
      icon: <HiOutlineBookOpen className="w-6 h-6 text-blue-600" />,
      link: "/client/documentation"
    },
    {
      title: "User Guides",
      description: "Download detailed user guides and manuals",
      icon: <HiOutlineClipboardList className="w-6 h-6 text-blue-600" />,
      link: "/client/guides"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-0"
    >
      <div className="max-w-full space-y-6 px-4 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help Center</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find answers to common questions and get support when you need it
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white"
          >
            <div className="flex items-center space-x-3 mb-4">
              <HiOutlineChat className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Live Chat</h3>
            </div>
            <p className="mb-4 text-blue-100">Chat with our support team in real-time</p>
            <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Start Chat
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white"
          >
            <div className="flex items-center space-x-3 mb-4">
              <HiOutlinePhone className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Phone Support</h3>
            </div>
            <p className="mb-4 text-purple-100">Call us 24/7 for immediate help</p>
            <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors">
              1-800-LEGAL-HELP
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white"
          >
            <div className="flex items-center space-x-3 mb-4">
              <HiOutlineMail className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Email Support</h3>
            </div>
            <p className="mb-4 text-green-100">Get help via email within 24 hours</p>
            <button className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors">
              Send Email
            </button>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {resources.map((resource, index) => (
              <HelpCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpPage; 