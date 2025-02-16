import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
              w-full ${sizes[size]} z-50`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b 
                border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 
                    dark:hover:bg-gray-700 transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal; 