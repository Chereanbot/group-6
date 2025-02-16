"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMicrophone,
  HiOutlinePhone,
  HiOutlineCog,
  HiOutlineVolumeUp,
  HiX,
  HiOutlineUserCircle,
  HiOutlineMicrophoneOff,
  HiOutlineVideoCamera,
  HiOutlineVideoCameraOff,
  HiOutlineChatAlt2
} from 'react-icons/hi';
import VideoCallChat from './VideoCallChat';

const VideoCall = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
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
          <img
            src="/avatars/lawyer1.jpg"
            alt="John Doe"
            className="w-10 h-10 rounded-full"
          />
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

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        {/* Remote Video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800">
          <video
            className="w-full h-full object-cover"
            poster="/avatars/lawyer1.jpg"
          />
          <div className="absolute bottom-4 left-4">
            <span className="px-2 py-1 bg-gray-900/70 rounded-lg text-white text-sm">
              John Doe
            </span>
          </div>
        </div>

        {/* Local Video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800">
          <video
            className="w-full h-full object-cover mirror"
            poster="/avatars/client1.jpg"
          />
          <div className="absolute bottom-4 left-4">
            <span className="px-2 py-1 bg-gray-900/70 rounded-lg text-white text-sm">
              You
            </span>
          </div>
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
              <HiOutlineMicrophoneOff className="w-6 h-6 text-white" />
            ) : (
              <HiOutlineMicrophone className="w-6 h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full ${
              !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoOn ? (
              <HiOutlineVideoCamera className="w-6 h-6 text-white" />
            ) : (
              <HiOutlineVideoCameraOff className="w-6 h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600"
          >
            <HiOutlinePhone className="w-6 h-6 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-4 rounded-full ${
              isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <HiOutlineUserCircle className="w-6 h-6 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full ${
              showChat ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <HiOutlineChatAlt2 className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800 border-l 
              border-gray-700 shadow-xl"
          >
            <VideoCallChat onClose={() => setShowChat(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
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
              {/* Settings content */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCall; 