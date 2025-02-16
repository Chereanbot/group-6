"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlinePaperClip,
  HiOutlineEmojiHappy,
  HiOutlineSend,
  HiX,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiCheck,
  HiCheckCircle
} from 'react-icons/hi';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'me' | 'other';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  };
}

const VideoCallChat = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Chat</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'me' ? 'order-1' : ''}`}>
              <div className={`rounded-lg p-3 ${
                message.sender === 'me' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-700 text-white'
              }`}>
                {message.content}
                {message.attachment && (
                  <div className="mt-2 p-2 rounded bg-black/20 flex items-center space-x-2">
                    {message.attachment.type === 'image' ? (
                      <HiOutlinePhotograph className="w-5 h-5" />
                    ) : (
                      <HiOutlineDocumentText className="w-5 h-5" />
                    )}
                    <span className="text-sm truncate">{message.attachment.name}</span>
                  </div>
                )}
              </div>
              <div className={`flex items-center space-x-2 mt-1
                ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-gray-400">{message.timestamp}</span>
                {message.sender === 'me' && (
                  message.status === 'read' ? (
                    <HiCheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <HiCheck className="w-4 h-4 text-gray-400" />
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400
                focus:ring-2 focus:ring-primary-500 border-none resize-none max-h-32"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-1.5 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white"
              >
                <HiOutlinePaperClip className="w-5 h-5" />
              </button>
              <button className="p-1.5 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white">
                <HiOutlineEmojiHappy className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            className="p-3 bg-primary-500 text-white rounded-full
              hover:bg-primary-600 transition-colors"
          >
            <HiOutlineSend className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Attachment Menu */}
      {showAttachMenu && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 right-16 bg-gray-700 rounded-lg shadow-lg p-2"
        >
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 p-2 hover:bg-gray-600 rounded-lg">
              <HiOutlinePhotograph className="w-5 h-5 text-blue-400" />
              <span className="text-white">Photo</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-2 hover:bg-gray-600 rounded-lg">
              <HiOutlineDocumentText className="w-5 h-5 text-green-400" />
              <span className="text-white">Document</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoCallChat; 