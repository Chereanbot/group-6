"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMicrophone,
  HiOutlinePhone,
  HiOutlineCog,
  HiOutlineVolumeUp,
  HiX,
  HiMicrophone,
  HiMicrophoneOff,
  HiOutlineUserCircle
} from 'react-icons/hi';

const VoiceCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Call Header */}
      <div className="p-4 flex justify-between items-center bg-gray-800/50 backdrop-blur">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
            <HiOutlineUserCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium">John Doe</h2>
            <p className="text-gray-400 text-sm">
              {formatDuration(callDuration)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white">
            <HiOutlineVolumeUp className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white"
          >
            <HiOutlineCog className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Call Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-32 h-32 rounded-full bg-primary-500/20 mx-auto
              flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
              className="w-24 h-24 rounded-full bg-primary-500/40
                flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500
                flex items-center justify-center">
                <HiOutlineUserCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
          <h3 className="mt-8 text-xl font-medium text-white">John Doe</h3>
          <p className="mt-2 text-gray-400">Lawyer</p>
        </div>
      </div>

      {/* Call Controls */}
      <div className="p-6 bg-gray-800/50 backdrop-blur">
        <div className="flex justify-center items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? (
              <HiMicrophoneOff className="w-6 h-6 text-white" />
            ) : (
              <HiMicrophone className="w-6 h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600"
          >
            <HiOutlinePhone className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Call Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              {/* Add settings content here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCall; 