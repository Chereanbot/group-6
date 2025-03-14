import React from 'react';
import {
  HiOutlineScale,
  HiOutlineClipboardCheck,
  HiOutlineDocumentAdd,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

export const CaseManagementGuide = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <HiOutlineScale className="w-6 h-6 mr-2 text-indigo-500" />
          Case Management Guide
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Effective case management is crucial for providing quality legal aid services.
          This guide covers all aspects of handling cases from intake to resolution.
        </p>
      </section>

      <section>
        <h4 className="font-medium mb-3">Case Status Types:</h4>
        <div className="grid gap-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h5 className="font-medium mb-2 flex items-center text-yellow-700 dark:text-yellow-300">
              <HiOutlineClock className="w-5 h-5 mr-2" />
              Pending
            </h5>
            <p className="text-sm text-yellow-600 dark:text-yellow-300">
              New cases awaiting initial review and lawyer assignment.
              These require immediate attention for processing.
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="font-medium mb-2 flex items-center text-blue-700 dark:text-blue-300">
              <HiOutlineClipboardCheck className="w-5 h-5 mr-2" />
              Active
            </h5>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Cases currently being handled by assigned lawyers.
              Regular monitoring and updates required.
            </p>
          </div>

          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h5 className="font-medium mb-2 flex items-center text-red-700 dark:text-red-300">
              <HiOutlineExclamation className="w-5 h-5 mr-2" />
              Urgent
            </h5>
            <p className="text-sm text-red-600 dark:text-red-300">
              High-priority cases requiring immediate attention.
              These cases have critical deadlines or sensitive matters.
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h5 className="font-medium mb-2 flex items-center text-green-700 dark:text-green-300">
              <HiOutlineCheckCircle className="w-5 h-5 mr-2" />
              Completed
            </h5>
            <p className="text-sm text-green-600 dark:text-green-300">
              Successfully resolved cases. These should be properly archived
              and documented for future reference.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Case Management Process:</h4>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">1. Case Intake</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Verify client eligibility for legal aid</li>
              <li>Collect all necessary client information and documentation</li>
              <li>Create new case record in the system</li>
              <li>Assign initial priority level</li>
              <li>Schedule initial consultation if necessary</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">2. Lawyer Assignment</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Review lawyer expertise and current workload</li>
              <li>Consider case complexity and urgency</li>
              <li>Make appropriate lawyer assignment</li>
              <li>Send notification to assigned lawyer</li>
              <li>Schedule case handover meeting if required</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">3. Case Monitoring</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Track case progress and updates</li>
              <li>Monitor document submissions and deadlines</li>
              <li>Coordinate between client and lawyer</li>
              <li>Handle appointment scheduling</li>
              <li>Maintain case notes and status updates</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">4. Case Closure</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Verify all required documents are filed</li>
              <li>Collect final case outcome information</li>
              <li>Update case status to completed</li>
              <li>Archive case documents properly</li>
              <li>Gather client feedback if applicable</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Document Management:</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <div>
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineDocumentAdd className="w-5 h-5 mr-2 text-indigo-500" />
              Required Documents
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Client identification and contact information</li>
              <li>Case-related documentation and evidence</li>
              <li>Legal forms and applications</li>
              <li>Court documents and filings</li>
              <li>Correspondence records</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-indigo-700 dark:text-indigo-300">Best Practices:</h4>
        <ul className="list-disc pl-5 space-y-2 text-indigo-600 dark:text-indigo-300">
          <li>Review pending cases daily</li>
          <li>Maintain clear communication with clients and lawyers</li>
          <li>Document all case activities and updates</li>
          <li>Follow up on pending documents promptly</li>
          <li>Keep case status information current</li>
          <li>Regular backup of case documents</li>
          <li>Maintain client confidentiality at all times</li>
        </ul>
      </section>
    </div>
  );
}; 