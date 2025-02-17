import React from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineX
} from 'react-icons/hi';
import { ReviewItem } from './ReviewItem';
import Timeline from './Timeline';

interface PreviewCaseProps {
  formData: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    clientAddress: string;
    caseType: string;
    caseCategory: string;
    caseSubType: string;
    caseDescription: string;
    priority: string;
    expectedResolutionDate: string;
    region: string;
    zone: string;
    wereda: string;
    kebele: string;
    houseNumber: string;
    clientRequest: string;
    tags: string[];
    documents: File[];
    officeId: string;
    status: string;
    coordinatorId?: string;
    coordinatorName?: string;
    officeName?: string;
    activities?: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      createdAt: Date;
      metadata?: any;
      user?: {
        id: string;
        fullName: string;
        email: string;
        userRole: string;
      };
    }>;
  };
  onClose: () => void;
}

export function PreviewCase({ formData, onClose }: PreviewCaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Case Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <HiOutlineUser className="h-5 w-5 mr-2" />
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white">{formData.clientName || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <p className="text-gray-900 dark:text-white">{formData.clientPhone || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{formData.clientEmail || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                <p className="text-gray-900 dark:text-white">{formData.clientAddress || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Case Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <HiOutlineDocumentText className="h-5 w-5 mr-2" />
              Case Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <p className="text-gray-900 dark:text-white">{formData.caseType || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                <p className="text-gray-900 dark:text-white">{formData.priority || 'N/A'}</p>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-gray-900 dark:text-white">{formData.caseDescription || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <HiOutlineLocationMarker className="h-5 w-5 mr-2" />
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Region</label>
                <p className="text-gray-900 dark:text-white">{formData.region || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Zone</label>
                <p className="text-gray-900 dark:text-white">{formData.zone || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Wereda</label>
                <p className="text-gray-900 dark:text-white">{formData.wereda || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Kebele</label>
                <p className="text-gray-900 dark:text-white">{formData.kebele || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Office Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <HiOutlineOfficeBuilding className="h-5 w-5 mr-2" />
              Office Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Office Name</label>
                <p className="text-gray-900 dark:text-white">{formData.officeName || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordinator</label>
                <p className="text-gray-900 dark:text-white">{formData.coordinatorName || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Office ID</label>
                <p className="text-gray-900 dark:text-white">{formData.officeId || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-gray-900 dark:text-white">{formData.status || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <HiOutlineDocumentText className="h-5 w-5 mr-2" />
              Documents
            </h3>
            <div className="space-y-2">
              {formData.documents.length > 0 ? (
                <ul className="space-y-2">
                  {formData.documents.map((doc, index) => (
                    <li key={index} className="flex items-center text-gray-900 dark:text-white">
                      <HiOutlineDocumentText className="h-5 w-5 mr-2 text-gray-500" />
                      {doc.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No documents attached</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <HiOutlineTag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 