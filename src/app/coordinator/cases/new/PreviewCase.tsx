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
import { Timeline } from './Timeline';

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

export const PreviewCase: React.FC<PreviewCaseProps> = ({ formData, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Case Preview</h2>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-circle"
        >
          <HiOutlineX className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Client Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewItem
              label="Client Name"
              value={formData.clientName}
              icon={<HiOutlineUser className="h-5 w-5" />}
            />
            <ReviewItem
              label="Phone Number"
              value={formData.clientPhone}
              icon={<HiOutlinePhone className="h-5 w-5" />}
            />
            <ReviewItem
              label="Email"
              value={formData.clientEmail}
              icon={<HiOutlineMail className="h-5 w-5" />}
            />
            <ReviewItem
              label="Address"
              value={formData.clientAddress}
              icon={<HiOutlineLocationMarker className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Case Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Case Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewItem
              label="Case Type"
              value={formData.caseType}
              icon={<HiOutlineDocumentText className="h-5 w-5" />}
            />
            <ReviewItem
              label="Case Category"
              value={formData.caseCategory}
              icon={<HiOutlineTag className="h-5 w-5" />}
            />
            <ReviewItem
              label="Priority"
              value={formData.priority}
              icon={<HiOutlineTag className="h-5 w-5" />}
            />
            <ReviewItem
              label="Expected Resolution"
              value={formData.expectedResolutionDate}
              icon={<HiOutlineCalendar className="h-5 w-5" />}
            />
          </div>
          <div className="mt-4">
            <ReviewItem
              label="Case Description"
              value={formData.caseDescription}
              icon={<HiOutlineDocumentText className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Location Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviewItem
              label="Region"
              value={formData.region}
              icon={<HiOutlineLocationMarker className="h-5 w-5" />}
            />
            <ReviewItem
              label="Zone"
              value={formData.zone}
              icon={<HiOutlineLocationMarker className="h-5 w-5" />}
            />
            <ReviewItem
              label="Wereda"
              value={formData.wereda}
              icon={<HiOutlineLocationMarker className="h-5 w-5" />}
            />
            <ReviewItem
              label="Kebele"
              value={formData.kebele}
              icon={<HiOutlineLocationMarker className="h-5 w-5" />}
            />
            <ReviewItem
              label="House Number"
              value={formData.houseNumber}
              icon={<HiOutlineLocationMarker className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
          <div className="space-y-4">
            <ReviewItem
              label="Client Request"
              value={formData.clientRequest}
              icon={<HiOutlineDocumentText className="h-5 w-5" />}
            />
            {formData.tags.length > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-base-200 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <HiOutlineTag className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary text-white px-2 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {formData.documents.length > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-base-200 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <HiOutlineDocumentText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Documents</h4>
                  <div className="mt-1">
                    {formData.documents.map((doc, index) => (
                      <p key={index} className="text-base">
                        {doc.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Office Assignment */}
        {formData.officeId && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Office Assignment</h3>
            <ReviewItem
              label="Assigned Office"
              value={formData.officeId}
              icon={<HiOutlineOfficeBuilding className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Timeline Section */}
        {formData.activities && formData.activities.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Case Timeline</h3>
            <Timeline activities={formData.activities} />
          </div>
        )}
      </div>
    </motion.div>
  );
}; 