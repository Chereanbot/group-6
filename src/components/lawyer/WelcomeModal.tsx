'use client'

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Briefcase, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Lottie from 'react-lottie-player';
import welcomeAnimation from '@/animations/welcome.json';

interface Props {
  lawyerName: string;
  onStartTour: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function WelcomeModal({ lawyerName, onStartTour, onClose, isOpen }: Props) {
  if (!isOpen) return null;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="text-center mb-6">
              <div className="w-64 h-64 mx-auto mb-4">
                <Lottie
                  loop
                  animationData={welcomeAnimation}
                  play
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome, {lawyerName}!
              </Dialog.Title>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Let's help you get started with your legal practice management system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 text-center">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Manage Cases</h3>
                <p className="text-sm text-gray-500">Track and organize all your legal cases</p>
              </div>
              <div className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Track Time</h3>
                <p className="text-sm text-gray-500">Log billable hours efficiently</p>
              </div>
              <div className="p-4 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Client Communication</h3>
                <p className="text-sm text-gray-500">Stay connected with your clients</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={onClose}>
                Skip Tour
              </Button>
              <Button onClick={onStartTour}>
                Start Quick Tour
              </Button>
            </div>
          </motion.div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 