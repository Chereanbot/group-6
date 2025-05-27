"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiOutlineLightningBolt } from 'react-icons/hi';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-0"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 text-transparent bg-clip-text">
              Ready to Get Started?
            </h2>
            <p className="text-blue-200">
              Join thousands of satisfied clients who trust our legal services
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Sign Up Now
              <HiOutlineLightningBolt className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-800 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 