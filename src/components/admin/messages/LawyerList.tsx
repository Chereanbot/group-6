"use client";

import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineMail, HiOutlinePhone, HiOutlineGlobe } from 'react-icons/hi';
import { UserRoleEnum } from '@prisma/client';
import { useState } from 'react';

interface LawyerProfile {
  specializations: string[];
  experience: number;
  phoneNumber?: string;
}

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  userRole: UserRoleEnum;
  lawyerProfile?: LawyerProfile;
  imageUrl?: string;
}

interface LawyerListProps {
  lawyers: Lawyer[];
  onSelectLawyer: (lawyer: Lawyer) => void;
  selectedLawyerId?: string;
}

export default function LawyerList({ lawyers, onSelectLawyer, selectedLawyerId }: LawyerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filteredLawyers = lawyers
    .filter(lawyer =>
      searchQuery
        ? lawyer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lawyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lawyer.lawyerProfile?.specializations.some(s => 
            s.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === 'experience') {
        return (b.lawyerProfile?.experience || 0) - (a.lawyerProfile?.experience || 0);
      }
      return 0;
    });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search lawyers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredLawyers.map((lawyer) => (
          <motion.div
            key={lawyer.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onSelectLawyer(lawyer)}
            className={`p-4 border-b dark:border-gray-700 cursor-pointer ${
              selectedLawyerId === lawyer.id
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {lawyer.imageUrl ? (
                  <img
                    src={lawyer.imageUrl}
                    alt={lawyer.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {lawyer.fullName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium dark:text-white">{lawyer.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lawyer.lawyerProfile?.specializations.join(', ')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lawyer.lawyerProfile?.experience} years of experience
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `mailto:${lawyer.email}`;
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Send Email"
                >
                  <HiOutlineMail className="w-5 h-5" />
                </button>
                {lawyer.lawyerProfile?.phoneNumber && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `sms:${lawyer.lawyerProfile.phoneNumber}`;
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    title="Send SMS"
                  >
                    <HiOutlinePhone className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // This will be handled by the parent component
                    onSelectLawyer(lawyer);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Send Web Message"
                >
                  <HiOutlineGlobe className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 