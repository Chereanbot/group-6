"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlinePencilAlt,
  HiOutlineChat,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamation
} from 'react-icons/hi';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  author: string;
  comments: Comment[];
  tags: string[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Initial Case Assessment',
    content: 'Client presented evidence of property ownership dispute...',
    category: 'Case Analysis',
    priority: 'high',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-07',
    author: 'John Doe',
    tags: ['property', 'dispute', 'initial-review'],
    comments: [
      {
        id: 'c1',
        content: 'Additional documents needed for verification',
        author: 'Jane Smith',
        createdAt: '2024-03-06'
      }
    ]
  },
  // Add more mock notes...
];

const CaseNotes = () => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['Case Analysis', 'Client Meeting', 'Court Proceedings', 'Evidence Review'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Case Notes</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and organize case-related notes and discussions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <button
          onClick={() => setShowNewNoteModal(true)}
          className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg
            hover:bg-primary-600 transition-colors"
        >
          <HiOutlinePlusCircle className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Note Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{note.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs capitalize
                  ${getPriorityColor(note.priority)}`}>
                  {note.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {note.category}
              </p>
            </div>

            {/* Note Content */}
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {note.content}
              </p>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Note Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>By {note.author}</p>
                  <p>Updated {note.updatedAt}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedNote(note)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <HiOutlinePencilAlt className="w-5 h-5 text-primary-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                    <HiOutlineChat className="w-5 h-5 text-primary-500" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Case Note</h2>
              <button
                onClick={() => setShowNewNoteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500">
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 h-32"
                  placeholder="Enter note content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg
                    hover:bg-primary-600 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CaseNotes; 