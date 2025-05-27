"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const partners = [
  {
    name: "Ministry of Justice",
    logo: "/images/partners/moj.png",
    description: "Government Partner"
  },
  {
    name: "United Nations",
    logo: "/images/partners/un.png",
    description: "International Partner"
  },
  {
    name: "UNHCR",
    logo: "/images/partners/unhcr.png",
    description: "Refugee Support Partner"
  },
  {
    name: "Awash Bank",
    logo: "/images/partners/awash-bank.png",
    description: "Financial Partner"
  },
  {
    name: "CBE Birr",
    logo: "/images/partners/cbe-birr.png",
    description: "Payment Partner"
  }
];

const PartnersSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Duplicate partners array to create seamless loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Working together with leading organizations to provide comprehensive legal services
          </p>
        </motion.div>

        {/* Scrolling Partners Container */}
        <div 
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex space-x-8"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
            style={{
              width: "fit-content",
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                className="group relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-[200px] h-[200px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative h-full w-full">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {partner.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Gradient Overlays for Smooth Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-900 pointer-events-none" />
        </div>

        {/* Partnership CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-block rounded-2xl bg-gradient-to-r from-primary-500/10 to-primary-600/10 p-8 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Want to Partner With Us?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
              Join our network of partners and help us make legal services more accessible to those in need.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Become a Partner
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection; 