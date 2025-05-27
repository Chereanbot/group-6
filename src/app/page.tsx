"use client";

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturesSection from './components/sections/FeaturesSection';
import ServicesSection from './components/sections/ServicesSection';
import TestimonialsSection from './components/sections/TestimonialsSection';
import PartnersSection from './components/PartnersSection';
import CTASection from './components/sections/CTASection';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
      <main>
        <Hero />
        <FeaturesSection />
        <ServicesSection />
        <TestimonialsSection />
        <PartnersSection />
        <CTASection />
        <Footer />
      </main>
      <ScrollToTop />
      </div>
  );
}
