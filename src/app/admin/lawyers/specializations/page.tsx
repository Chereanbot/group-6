"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBadgeCheck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineScale,
  HiOutlineAcademicCap,
} from 'react-icons/hi';
import SpecializationModal from '@/components/admin/specializations/SpecializationModal';

interface Specialization {
  id: string;
  facultyName: string;
  title: string;  // Academic title
  department: string;
  specialization: string;
  description: string;
  yearsOfExperience: number;
  casesHandled: number;
  successRate: number;
  expertise: string[];
  currentCases: number;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
}

export default function SpecializationsPage() {
  const [specializations, setSpecializations] = useState<Specialization[]>([
    {
      id: '1',
      facultyName: 'Dr. Cherinet Hailu',
      title: 'Associate Professor',
      department: 'Criminal Law',
      specialization: 'Criminal Justice',
      description: 'Expert in criminal defense and prosecution with focus on human rights',
      yearsOfExperience: 8,
      casesHandled: 45,
      successRate: 87,
      expertise: ['Criminal Defense', 'Human Rights Law', 'Constitutional Law'],
      currentCases: 3,
      education: [
        {
          degree: 'PhD in Criminal Law',
          institution: 'Addis Ababa University',
          year: 2018
        },
        {
          degree: 'LLM in Human Rights Law',
          institution: 'Dilla University',
          year: 2015
        }
      ]
    },
    {
      id: '2',
      facultyName: 'Dr. Abebe Kebede',
      title: 'Assistant Professor',
      department: 'Civil Law',
      specialization: 'Family Law',
      description: 'Specialized in family law and civil disputes resolution',
      yearsOfExperience: 6,
      casesHandled: 38,
      successRate: 92,
      expertise: ['Family Law', 'Civil Litigation', 'Mediation'],
      currentCases: 2,
      education: [
        {
          degree: 'PhD in Civil Law',
          institution: 'Dilla University',
          year: 2019
        }
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Faculty Specializations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dilla University Law School - Faculty Expertise Directory
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Faculty Specialization
        </button>
      </div>

      {/* Specialization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specializations.map((spec) => (
          <motion.div
            key={spec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            {/* Card content */}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{spec.facultyName}</h3>
                  <p className="text-gray-500">{spec.title} - {spec.department}</p>
                </div>
                <button
                  onClick={() => setSelectedSpecialization(spec)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium">Specialization</h4>
                  <p className="text-gray-600">{spec.specialization}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-primary-600">
                      {spec.yearsOfExperience}
                    </div>
                    <div className="text-sm text-gray-500">Years Exp.</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {spec.successRate}%
                    </div>
                    <div className="text-sm text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {spec.currentCases}
                    </div>
                    <div className="text-sm text-gray-500">Active Cases</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {spec.expertise.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <SpecializationModal 
        isOpen={isModalOpen || !!selectedSpecialization}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSpecialization(null);
        }}
        initialData={selectedSpecialization}
      />
    </div>
  );
} 