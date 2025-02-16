"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HiOutlineX, HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineChartBar } from 'react-icons/hi';
import { Specialization } from '@/types/faculty.types';

interface FacultyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Specialization;
}

const FacultyProfileModal = ({ isOpen, onClose, faculty }: FacultyProfileModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold">{faculty.facultyName}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faculty.title} - {faculty.department}
                  </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <HiOutlineAcademicCap className="w-5 h-5 mr-2" />
                        Specialization
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {faculty.specialization}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <HiOutlineBriefcase className="w-5 h-5 mr-2" />
                        Experience
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {faculty.yearsOfExperience} years
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Areas of Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {faculty.expertise.map((area, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 
                              text-primary-600 dark:text-primary-400 rounded-full text-sm"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Performance Metrics */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-4 flex items-center">
                        <HiOutlineChartBar className="w-5 h-5 mr-2" />
                        Performance Metrics
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Success Rate</span>
                            <span className="font-medium">{faculty.successRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${faculty.successRate}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Case Load</span>
                            <span className="font-medium">{faculty.currentCases}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(faculty.currentCases / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Case History</h3>
                      <p className="text-3xl font-bold text-primary-600">
                        {faculty.casesHandled}
                      </p>
                      <p className="text-sm text-gray-500">Total cases handled</p>
                    </div>
                  </div>

                  {/* Right Column - Education & Publications */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-4">Education</h3>
                      <div className="space-y-4">
                        {faculty.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-primary-500 pl-4">
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {faculty.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FacultyProfileModal; 