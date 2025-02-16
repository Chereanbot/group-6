import { motion } from 'framer-motion';
import { CaseFormData } from './types';
import { ReviewItem } from './ReviewItem';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineChevronLeft
} from 'react-icons/hi';

interface PreviewCaseProps {
  data: CaseFormData;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
  darkMode?: boolean;
}

export function PreviewCase({ data, onConfirm, onBack, loading = false, darkMode = false }: PreviewCaseProps) {
  const sections = [
    {
      title: 'Client Information',
      items: [
        { label: 'Name', value: data.clientName, icon: HiOutlineUser },
        { label: 'Phone', value: data.clientPhone, icon: HiOutlinePhone },
        { label: 'Address', value: data.clientAddress, icon: HiOutlineLocationMarker }
      ]
    },
    {
      title: 'Location Details',
      items: [
        { label: 'Region', value: data.region },
        { label: 'Zone', value: data.zone },
        { label: 'Wereda', value: data.wereda },
        { label: 'Kebele', value: data.kebele },
        { label: 'House Number', value: data.houseNumber }
      ]
    },
    {
      title: 'Case Information',
      items: [
        { label: 'Category', value: data.category, icon: HiOutlineTag },
        { label: 'Type', value: data.caseType, icon: HiOutlineDocumentText },
        { label: 'Description', value: data.caseDescription },
        { label: 'Priority', value: data.priority, icon: HiOutlineExclamationCircle },
        { label: 'Expected Resolution', value: data.expectedResolutionDate, icon: HiOutlineCalendar }
      ]
    },
    {
      title: 'Request Details',
      items: [
        { label: 'Client Request', value: data.clientRequest },
        ...(data.requestDetails?.questions || []).map((qa, index) => ({
          label: `Question ${index + 1}`,
          value: `Q: ${qa.question}\nA: ${qa.answer}`
        })),
        { label: 'Additional Notes', value: data.requestDetails?.additionalNotes }
      ]
    },
    {
      title: 'Documents',
      items: [
        { 
          label: 'Uploaded Documents', 
          value: data.documents.length 
            ? `${data.documents.length} document(s) attached` 
            : 'No documents attached'
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border 
        border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm
        transition-all duration-300 hover:shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700
          bg-gradient-to-r from-primary-50 to-transparent dark:from-gray-900 dark:to-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100
            tracking-tight">
            Review Case Details
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400
            leading-relaxed">
            Please review all information before creating the case
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100
                  border-b border-gray-200 dark:border-gray-700 pb-2">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.items.map((item, itemIndex) => (
                    <ReviewItem
                      key={itemIndex}
                      label={item.label}
                      value={item.value}
                      icon={item.icon}
                      className="transform transition hover:scale-102"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 text-sm font-medium 
            text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 
            border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
            hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
            disabled:opacity-50 transition-all duration-200"
        >
          <HiOutlineChevronLeft className="w-5 h-5 mr-2" />
          Back to Edit
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex items-center px-6 py-3 text-sm font-medium 
            text-white bg-primary-600 border border-transparent rounded-lg shadow-md
            hover:bg-primary-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50
            transition-all duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" 
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Case...
            </>
          ) : (
            <>
              <HiOutlineCheck className="w-5 h-5 mr-2" />
              Create Case
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}