"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { HiOutlineStar, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const testimonials = [
  {
    id: 1,
    name: "Abebe Kebede",
    role: "Refugee Client",
    image: "/images/testimonials/client1.jpg",
    rating: 5,
    content: "The legal aid service provided by Dilla University has been a lifeline for me and my family. Their dedication to helping refugees navigate complex legal processes is truly remarkable.",
    location: "Dilla, Ethiopia"
  },
  {
    id: 2,
    name: "Fatima Ahmed",
    role: "Community Member",
    image: "/images/testimonials/client2.jpg",
    rating: 5,
    content: "I was struggling with a property dispute for months. The team at Dilla University Legal Aid Service helped me understand my rights and guided me through the entire process with patience and expertise.",
    location: "Hawassa, Ethiopia"
  },
  {
    id: 3,
    name: "Solomon Teklu",
    role: "Student Client",
    image: "/images/testimonials/client3.jpg",
    rating: 5,
    content: "As a student, I was facing a complex legal issue. The legal aid service not only helped me resolve it but also educated me about my rights. Their commitment to student welfare is outstanding.",
    location: "Addis Ababa, Ethiopia"
  },
  {
    id: 4,
    name: "Mekdes Haile",
    role: "Community Leader",
    image: "/images/testimonials/client4.jpg",
    rating: 5,
    content: "The impact of Dilla University's legal aid service in our community has been transformative. They've helped countless individuals access justice and understand their legal rights.",
    location: "Dilla, Ethiopia"
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary-500/5 to-transparent" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-100/20 dark:bg-primary-900/10 blur-3xl" />
      <div className="absolute bottom-0 -left-24 w-64 h-64 rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-2xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
              <HiOutlineStar className="mr-1.5 h-4 w-4" />
              DULAS Client Stories
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-blue-600 text-transparent bg-clip-text"
          >
            Client Success Stories
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Hear from those who have experienced Dilla University Legal Aid Service firsthand
            and how our team has made a difference in their lives
          </motion.p>
        </div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border-t-4 border-primary-500"
            >
              {/* Quote mark decoration */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-serif">
                "
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Client Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-700"
                >
                  <Image
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>

                {/* Testimonial Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                      >
                        <HiOutlineStar className="w-6 h-6 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white mb-6 italic">
                    {testimonials[activeIndex].content}
                  </blockquote>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonials[activeIndex].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {testimonials[activeIndex].role} • {testimonials[activeIndex].location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <HiOutlineChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <HiOutlineChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Testimonial Thumbnails */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-center gap-4 mt-12"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
              className={`relative w-16 h-16 rounded-full cursor-pointer transition-all duration-300 ${
                activeIndex === index ? 'ring-4 ring-primary-500' : ''
              }`}
            >
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover rounded-full"
              />
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg whitespace-nowrap"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'bg-primary-500 w-8'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
        
        {/* Impact Summary Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-8 md:p-12 shadow-lg border border-primary-100 dark:border-primary-800/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2"
              >
                500+
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Clients Served</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Providing legal assistance to those in need</p>
            </div>
            
            <div className="text-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2"
              >
                95%
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Client Satisfaction</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Based on post-service feedback</p>
            </div>
            
            <div className="text-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2"
              >
                50+
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Legal Experts</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Dedicated to serving the community</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <motion.p 
              whileInView={{ scale: [0.9, 1] }}
              transition={{ duration: 0.5 }}
              className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto italic"
            >
              "At Dilla University Legal Aid Service, we're committed to providing accessible legal assistance to all members of our community, regardless of their background or financial situation."
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 