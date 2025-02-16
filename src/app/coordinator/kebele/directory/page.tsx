"use client";

import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import { motion } from 'framer-motion';

interface Kebele {
  id: string;
  kebeleNumber: string;
  kebeleName: string;
  population: number;
  subCity: string;
  district: string;
  mainOffice: string;
  contactPhone: string;
  contactEmail: string;
  workingHours: string;
  services: string[];
  manager?: {
    fullName: string;
    phone: string;
    email: string;
    position: string;
  };
}

export default function KebeleDirectory() {
  const [kebeles, setKebeles] = useState<Kebele[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedKebele, setSelectedKebele] = useState<Kebele | null>(null);

  useEffect(() => {
    fetchKebeles();
  }, []);

  const fetchKebeles = async () => {
    try {
      const response = await fetch('/api/coordinator/kebeles');
      const data = await response.json();
      setKebeles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching kebeles:', error);
      setLoading(false);
    }
  };

  const filteredKebeles = kebeles.filter(kebele =>
    kebele.kebeleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kebele.kebeleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kebele.subCity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Kebele Directory
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and view all registered kebeles in the system
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search kebeles by name, number, or sub-city..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent
            bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Kebele Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          [...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-6 h-48" />
          ))
        ) : (
          filteredKebeles.map((kebele) => (
            <motion.div
              key={kebele.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl 
                transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                      {kebele.kebeleName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kebele Number: {kebele.kebeleNumber}
                    </p>
                  </div>
                  <HiOutlineOfficeBuilding className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiOutlineUsers className="w-4 h-4 mr-2" />
                    <span>Population: {kebele.population?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiOutlinePhone className="w-4 h-4 mr-2" />
                    <span>{kebele.contactPhone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiOutlineMail className="w-4 h-4 mr-2" />
                    <span>{kebele.contactEmail || 'No email'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedKebele(kebele)}
                    className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 
                      text-white rounded-lg transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Kebele Details Modal */}
      {selectedKebele && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedKebele.kebeleName} Details
                </h2>
                <button
                  onClick={() => setSelectedKebele(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Location</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Sub City: {selectedKebele.subCity || 'N/A'}<br />
                      District: {selectedKebele.district || 'N/A'}<br />
                      Main Office: {selectedKebele.mainOffice || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Contact</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Phone: {selectedKebele.contactPhone || 'N/A'}<br />
                      Email: {selectedKebele.contactEmail || 'N/A'}<br />
                      Working Hours: {selectedKebele.workingHours || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedKebele.services?.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 
                          dark:text-primary-400 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedKebele.manager && (
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Manager Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Name: {selectedKebele.manager.fullName}<br />
                      Position: {selectedKebele.manager.position}<br />
                      Phone: {selectedKebele.manager.phone}<br />
                      Email: {selectedKebele.manager.email || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 