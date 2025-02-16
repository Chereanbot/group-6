'use client'

import { format } from 'date-fns';
import { 
  HiOutlineUser, 
  HiOutlinePhone, 
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineClock
} from 'react-icons/hi';

interface PreviewProps {
  data: any;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function PreviewCase({ data, onConfirm, onBack, loading }: PreviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
          Please review the case details before submitting
        </h3>
      </div>

      {/* Client Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiOutlineUser className="w-5 h-5 text-gray-500" />
          Client Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-medium">{data.clientName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p className="font-medium">{data.clientPhone}</p>
          </div>
          {data.clientAddress && (
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium">{data.clientAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiOutlineLocationMarker className="w-5 h-5 text-gray-500" />
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.region && (
            <div>
              <label className="text-sm text-gray-500">Region</label>
              <p className="font-medium">{data.region}</p>
            </div>
          )}
          {data.zone && (
            <div>
              <label className="text-sm text-gray-500">Zone</label>
              <p className="font-medium">{data.zone}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-500">Wereda</label>
            <p className="font-medium">{data.wereda}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Kebele</label>
            <p className="font-medium">{data.kebele}</p>
          </div>
          {data.houseNumber && (
            <div>
              <label className="text-sm text-gray-500">House Number</label>
              <p className="font-medium">{data.houseNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Case Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
          Case Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Case Type</label>
            <p className="font-medium">{data.caseType}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Description</label>
            <p className="font-medium">{data.caseDescription}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Priority</label>
              <p className="font-medium">{data.priority}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Case Date</label>
              <p className="font-medium">{format(new Date(data.caseDate), 'PPP')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiOutlineDocumentText className="w-5 h-5 text-gray-500" />
          Documents ({data.documents.length})
        </h3>
        {data.documents.length > 0 ? (
          <ul className="space-y-2">
            {data.documents.map((doc: any, index: number) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                  <span>{doc.file.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No documents attached</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Edit
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Creating Case...' : 'Confirm & Create Case'}
        </button>
      </div>
    </div>
  );
} 