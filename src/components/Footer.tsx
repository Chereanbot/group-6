"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlinePhone,
  HiOutlineMailOpen,
  HiOutlineLocationMarker,
} from 'react-icons/hi';

export const Footer = () => {
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
              {/* Add more social media links */}
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