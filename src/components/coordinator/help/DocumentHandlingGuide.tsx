import React from 'react';
import {
  HiOutlineDocumentText,
  HiOutlineDocumentAdd,
  HiOutlineDocumentDuplicate,
  HiOutlineDocumentSearch,
  HiOutlineShieldCheck,
  HiOutlineArchive,
} from 'react-icons/hi';

export const DocumentHandlingGuide = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <HiOutlineDocumentText className="w-6 h-6 mr-2 text-indigo-500" />
          Document Handling Guide
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Proper document management is essential for maintaining organized case records
          and ensuring efficient legal aid services. This guide covers all aspects of
          document handling procedures.
        </p>
      </section>

      <section>
        <h4 className="font-medium mb-3">Document Categories:</h4>
        <div className="grid gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineDocumentAdd className="w-5 h-5 mr-2 text-indigo-500" />
              Client Documents
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Personal identification (ID cards, passports)</li>
              <li>Contact information and address proof</li>
              <li>Income statements and financial records</li>
              <li>Supporting documents for legal aid eligibility</li>
              <li>Previous case records (if any)</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineDocumentDuplicate className="w-5 h-5 mr-2 text-indigo-500" />
              Case Documents
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Case intake forms and assessments</li>
              <li>Legal pleadings and motions</li>
              <li>Court orders and judgments</li>
              <li>Evidence and exhibits</li>
              <li>Correspondence with courts and parties</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center">
              <HiOutlineDocumentSearch className="w-5 h-5 mr-2 text-indigo-500" />
              Administrative Documents
            </h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Internal memos and notes</li>
              <li>Case assignment records</li>
              <li>Meeting minutes and summaries</li>
              <li>Progress reports and updates</li>
              <li>Client feedback forms</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Document Processing Steps:</h4>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">1. Document Reception</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Verify document completeness and readability</li>
              <li>Check for required signatures and dates</li>
              <li>Log receipt in the system</li>
              <li>Create digital copies if necessary</li>
              <li>Assign to appropriate case file</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">2. Document Review</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Check document accuracy and relevance</li>
              <li>Verify information consistency</li>
              <li>Identify missing information or documents</li>
              <li>Flag urgent or priority documents</li>
              <li>Route to appropriate staff member</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="font-medium mb-2">3. Document Storage</h5>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Follow proper filing system</li>
              <li>Maintain organized digital storage</li>
              <li>Ensure secure backup procedures</li>
              <li>Update document tracking system</li>
              <li>Implement retention policies</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Security Measures:</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="font-medium mb-2 flex items-center">
            <HiOutlineShieldCheck className="w-5 h-5 mr-2 text-indigo-500" />
            Document Security Protocols
          </h5>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Maintain client confidentiality at all times</li>
            <li>Use secure storage systems for sensitive documents</li>
            <li>Implement access controls and permissions</li>
            <li>Regular security audits and updates</li>
            <li>Proper document disposal procedures</li>
          </ul>
        </div>
      </section>

      <section>
        <h4 className="font-medium mb-3">Document Archiving:</h4>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="font-medium mb-2 flex items-center">
            <HiOutlineArchive className="w-5 h-5 mr-2 text-indigo-500" />
            Archiving Procedures
          </h5>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Determine appropriate retention period</li>
            <li>Organize documents for long-term storage</li>
            <li>Maintain searchable archive system</li>
            <li>Regular archive maintenance and cleanup</li>
            <li>Document retrieval procedures</li>
          </ul>
        </div>
      </section>

      <section className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-indigo-700 dark:text-indigo-300">Best Practices:</h4>
        <ul className="list-disc pl-5 space-y-2 text-indigo-600 dark:text-indigo-300">
          <li>Create and maintain detailed document logs</li>
          <li>Follow consistent naming conventions</li>
          <li>Regular document audits and updates</li>
          <li>Prompt processing of incoming documents</li>
          <li>Secure handling of confidential information</li>
          <li>Regular staff training on document procedures</li>
          <li>Maintain backup copies of critical documents</li>
        </ul>
      </section>
    </div>
  );
}; 